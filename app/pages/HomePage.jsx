import { useCallback, useEffect, useRef, useMemo } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import TopBar from "../components/TopBar";
import BottomNavBar from "../components/BottomNavBar";
import SearchBar from "../components/SearchBar";
import CategoryTab from "../components/CategoryTab";
import FeaturedCard from "../components/FeaturedCard";
import RoomCard from "../components/RoomCard";
import { COLORS, FONTS } from "../constants/colors";
import { NAV_TABS, navigateToTab } from "../constants/navigation";
import useRoomStore from "../store/useRoomStore";
import { useAuth } from "@/context/AuthContext";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 52 - 12) / 2;

const HomePage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const rooms = useRoomStore((state) => state.rooms);
  const searchQuery = useRoomStore((state) => state.searchQuery);
  const activeCategory = useRoomStore((state) => state.activeCategory);
  const featuredProperty = useRoomStore((state) => state.featuredProperty);
  const isRoomsLoading = useRoomStore((state) => state.isRoomsLoading);
  const hydrateRooms = useRoomStore((state) => state.hydrateRooms);
  const activeTab = useRoomStore((state) => state.activeTab);
  const setActiveTab = useRoomStore((state) => state.setActiveTab);
  const setActiveCategory = useRoomStore((state) => state.setActiveCategory);
  const setSearchQuery = useRoomStore((state) => state.setSearchQuery);

  const headerFade = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(contentFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(contentSlide, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [headerFade, contentFade, contentSlide]);

  useEffect(() => {
    hydrateRooms().catch(() => {
      // Non-blocking for now; API errors are surfaced in empty states.
    });
  }, [hydrateRooms]);

  const roomCategories = useMemo(() => {
    const categories = Array.from(new Set(rooms.map((room) => room.category)));
    return ["ALL", ...categories];
  }, [rooms]);

  const tabs = NAV_TABS;

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesCategory =
        activeCategory === "ALL" || room.category === activeCategory;
      const matchesSearch =
        query.length === 0 ||
        room.name.toLowerCase().includes(query) ||
        room.category.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [rooms, searchQuery, activeCategory]);

  const handleTabSelect = (id) => {
    setActiveTab(id);
    navigateToTab(router, id);
  };

  const renderRoomItem = ({ item }) => (
    <RoomCard
      item={item}
      cardWidth={CARD_WIDTH}
      onPress={() => router.push(`/rooms/${item.id}`)}
    />
  );

  const renderHeader = useCallback(
    () => (
      <Animated.View
        style={{
          opacity: contentFade,
          transform: [{ translateY: contentSlide }],
        }}
      >
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>
            Good Day, {user?.first_name || "Guest"}
          </Text>
          <Text style={styles.greetingSubtext}>
            Find your perfect stay today.
          </Text>
        </View>
    
        <SearchBar
          initialValue={searchQuery}
          onSubmit={setSearchQuery}
          placeholder="Search rooms..."
        />

        {/* <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterChipActive} activeOpacity={0.8}>
            <Text style={styles.filterChipIcon}>📅</Text>
            <Text style={styles.filterChipTextActive}>Oct 12 - 15</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterChip} activeOpacity={0.8}>
            <Text style={styles.filterChipIcon}>👤</Text>
            <Text style={styles.filterChipText}>2 Guests</Text>
          </TouchableOpacity>
        </View> */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
          contentContainerStyle={styles.tabsContent}
        >
          {roomCategories.map((cat) => (
            <CategoryTab
              key={cat}
              label={cat}
              active={activeCategory === cat}
              onPress={() => setActiveCategory(cat)}
            />
          ))}
        </ScrollView>

        {featuredProperty ? (
          <FeaturedCard
            item={featuredProperty}
            onPress={() => {
              const firstRoom = rooms[0];
              if (firstRoom) {
                router.push(`/rooms/${firstRoom.id}`);
              }
            }}
          />
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Rooms</Text>
          {/* <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.sectionViewAll}>View all</Text>
          </TouchableOpacity> */}
        </View>
      </Animated.View>
    ),
    // Only re-render the header when these values actually change — not on keystrokes.
    [
      contentFade,
      contentSlide,
      user,
      searchQuery,
      setSearchQuery,
      roomCategories,
      activeCategory,
      setActiveCategory,
      featuredProperty,
      rooms,
      router,
    ],
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <Animated.View style={{ opacity: headerFade }}>
        <TopBar />
      </Animated.View>

      <FlatList
        data={filteredRooms}
        renderItem={renderRoomItem}
        keyExtractor={(room) => room.id?.toString() ?? room.name}
        numColumns={2}
        columnWrapperStyle={styles.roomGrid}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={renderHeader}
        ListHeaderComponentStyle={styles.listHeader}
        ListFooterComponent={<View style={styles.listFooter} />}
        // ✅ FIX: Prevents the FlatList from stealing taps (and focus) away
        // from the keyboard while it's open.
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          !isRoomsLoading ? (
            <Text style={styles.emptyText}>No rooms found.</Text>
          ) : null
        }
      />

      <BottomNavBar
        tabs={tabs}
        activeId={activeTab}
        onSelect={handleTabSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  listHeader: {
    paddingBottom: 16,
  },
  listFooter: {
    height: 120,
  },
  greetingSection: {
    marginBottom: 18,
  },
  greetingText: {
    fontFamily: FONTS.headline,
    fontSize: 24,
    color: COLORS.primary,
    letterSpacing: 0.2,
  },
  greetingSubtext: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  filterChipActive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.neutral,
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  filterChipIcon: {
    fontSize: 14,
  },
  filterChipTextActive: {
    fontFamily: FONTS.label,
    fontSize: 13,
    color: COLORS.neutral,
  },
  filterChipText: {
    fontFamily: FONTS.label,
    fontSize: 13,
    color: COLORS.textBody,
  },
  tabsScroll: {
    marginHorizontal: -20,
    marginBottom: 14,
  },
  tabsContent: {
    paddingHorizontal: 20,
    gap: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    marginTop: 12,
  },
  sectionTitle: {
    fontFamily: FONTS.headline,
    fontSize: 18,
    color: COLORS.primary,
  },
  sectionViewAll: {
    fontFamily: FONTS.label,
    fontSize: 11.5,
    color: COLORS.secondary,
    letterSpacing: 1,
  },
  roomGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  emptyText: {
    marginTop: 12,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    textAlign: "center",
  },
});

export default HomePage;
