import { useCallback, useEffect, useRef, useMemo, useState } from "react";
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
import { getRoomBookedDates } from "../../src/services/roomService";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 52 - 12) / 2;

/**
 * Returns today's date as a YYYY-MM-DD string in local time,
 * matching the ISO strings returned by getRoomBookedDates.
 */
const getTodayString = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const HomePage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const rooms = useRoomStore((state) => state.rooms);
  const searchQuery = useRoomStore((state) => state.searchQuery);
  const activeCategory = useRoomStore((state) => state.activeCategory);
  const availabilityFilter = useRoomStore((state) => state.availabilityFilter);
  const featuredProperty = useRoomStore((state) => state.featuredProperty);
  const isRoomsLoading = useRoomStore((state) => state.isRoomsLoading);
  const hydrateRooms = useRoomStore((state) => state.hydrateRooms);
  const activeTab = useRoomStore((state) => state.activeTab);
  const setActiveTab = useRoomStore((state) => state.setActiveTab);
  const setActiveCategory = useRoomStore((state) => state.setActiveCategory);
  const setSearchQuery = useRoomStore((state) => state.setSearchQuery);
  const setAvailabilityFilter = useRoomStore(
    (state) => state.setAvailabilityFilter,
  );

  /**
   * bookedTodayIds – set of room IDs that have at least one booking
   * covering today's date (status pending or confirmed).
   * Populated in the background after rooms load; until then it's null
   * so we don't hide rooms while still fetching.
   */
  const [bookedTodayIds, setBookedTodayIds] = useState(null);

  const headerFade = useRef(new Animated.Value(0)).current;
  const greetingSlide = useRef(new Animated.Value(30)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(20)).current;
  const accentScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(contentFade, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.timing(contentSlide, {
          toValue: 0,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.timing(greetingSlide, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(accentScale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [headerFade, contentFade, contentSlide, greetingSlide, accentScale]);

  useEffect(() => {
    hydrateRooms().catch(() => {});
  }, [hydrateRooms]);

  /**
   * After rooms load, fetch booked dates for each room in parallel and
   * build the set of room IDs that are booked today.
   */
  useEffect(() => {
    if (!rooms || rooms.length === 0) return;

    const today = getTodayString();

    Promise.allSettled(
      rooms.map((room) =>
        getRoomBookedDates(room.id).then((dates) => ({
          id: room.id,
          // getRoomBookedDates returns Date objects; convert back to YYYY-MM-DD
          bookedToday: dates.some((d) => {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            return `${yyyy}-${mm}-${dd}` === today;
          }),
        })),
      ),
    ).then((results) => {
      const ids = new Set();
      results.forEach((res) => {
        if (res.status === "fulfilled" && res.value.bookedToday) {
          ids.add(res.value.id);
        }
      });
      setBookedTodayIds(ids);
    });
  }, [rooms]);

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

      // Availability is based on whether the room has an active booking today.
      // While booked-date data is still loading (bookedTodayIds === null),
      // treat every room as passing the filter so nothing disappears mid-load.
      const matchesAvailability =
        availabilityFilter === "all" ||
        bookedTodayIds === null ||
        (availabilityFilter === "available" && !bookedTodayIds.has(room.id));

      return matchesCategory && matchesSearch && matchesAvailability;
    });
  }, [rooms, searchQuery, activeCategory, availabilityFilter, bookedTodayIds]);

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
        {/* ── Greeting Block ── */}
        <Animated.View
          style={[
            styles.greetingSection,
            { transform: [{ translateY: greetingSlide }] },
          ]}
        >
          <View style={styles.greetingRow}>
            <View style={styles.greetingTextBlock}>
              <Text style={styles.greetingEyebrow}>WELCOME BACK</Text>
              <Text style={styles.greetingName}>
                {user?.first_name || "Guest"}
              </Text>
            </View>
            {/* Gold accent line */}
            <Animated.View
              style={[
                styles.greetingAccent,
                { transform: [{ scaleX: accentScale }] },
              ]}
            />
          </View>
          <Text style={styles.greetingSubtext}>
            Find your perfect stay today.
          </Text>
        </Animated.View>

        {/* ── Search ── */}
        <View style={styles.searchWrapper}>
          <SearchBar
            initialValue={searchQuery}
            onSubmit={setSearchQuery}
            placeholder="Search rooms or categories…"
          />
        </View>

        {/* ── Category Tabs ── */}
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

        {/* ── Featured ── */}
        {featuredProperty ? (
          <View style={styles.featuredWrapper}>
            <View style={styles.featuredLabelRow}>
              <View style={styles.featuredLabelLine} />
              <Text style={styles.featuredLabel}>FEATURED PROPERTY</Text>
              <View style={styles.featuredLabelLine} />
            </View>
            <FeaturedCard
              item={featuredProperty}
              onPress={() => {
                const firstRoom = rooms[0];
                if (firstRoom) router.push(`/rooms/${firstRoom.id}`);
              }}
            />
          </View>
        ) : null}

        {/* ── Section Header + Availability Toggle ── */}
        <View style={styles.sectionHeader}>
          {/* Left: dot + title + count */}
          <View style={styles.sectionTitleGroup}>
            <View style={styles.sectionTitleDot} />
            <Text style={styles.sectionTitle}>Rooms</Text>
            <Text style={styles.roomCount}>{filteredRooms.length}</Text>
          </View>

          {/* Right: compact pill toggle */}
          <View style={styles.pillToggle}>
            <TouchableOpacity
              style={[
                styles.pillOption,
                availabilityFilter === "all" && styles.pillOptionActive,
              ]}
              onPress={() => setAvailabilityFilter("all")}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.pillOptionText,
                  availabilityFilter === "all" && styles.pillOptionTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.pillOption,
                availabilityFilter === "available" && styles.pillOptionActive,
              ]}
              onPress={() => setAvailabilityFilter("available")}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.pillOptionText,
                  availabilityFilter === "available" &&
                    styles.pillOptionTextActive,
                ]}
              >
                Available
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    ),
    [
      contentFade,
      contentSlide,
      greetingSlide,
      accentScale,
      user,
      searchQuery,
      setSearchQuery,
      roomCategories,
      activeCategory,
      setActiveCategory,
      availabilityFilter,
      setAvailabilityFilter,
      featuredProperty,
      rooms,
      router,
      filteredRooms.length,
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
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          !isRoomsLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No rooms found.</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your search or filters.
              </Text>
            </View>
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
    paddingTop: 20,
    paddingBottom: 100,
  },
  listHeader: {
    paddingBottom: 8,
  },
  listFooter: {
    height: 100,
  },

  // ── Greeting ──────────────────────────────────
  greetingSection: {
    marginBottom: 22,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  greetingTextBlock: {
    flex: 1,
  },
  greetingEyebrow: {
    fontFamily: FONTS.label,
    fontSize: 9.5,
    color: COLORS.secondary,
    letterSpacing: 2.5,
    marginBottom: 3,
  },
  greetingName: {
    fontFamily: FONTS.headline,
    fontSize: 28,
    color: COLORS.primary,
    letterSpacing: 0.1,
    lineHeight: 33,
  },
  greetingAccent: {
    width: 42,
    height: 3,
    backgroundColor: COLORS.secondary,
    borderRadius: 2,
    marginBottom: 6,
    transformOrigin: "right",
  },
  greetingSubtext: {
    fontFamily: FONTS.bodyLight,
    fontSize: 13.5,
    color: COLORS.textMuted,
    letterSpacing: 0.1,
  },

  // ── Search ──────────────────────────────────
  searchWrapper: {
    marginBottom: 18,
  },

  // ── Tabs ──────────────────────────────────
  tabsScroll: {
    marginHorizontal: -20,
    marginBottom: 20,
  },
  tabsContent: {
    paddingHorizontal: 20,
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  // ── Featured ──────────────────────────────────
  featuredWrapper: {
    marginBottom: 6,
  },
  featuredLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  featuredLabelLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.inputBorder,
  },
  featuredLabel: {
    fontFamily: FONTS.label,
    fontSize: 9,
    color: COLORS.textMuted,
    letterSpacing: 2.2,
  },

  // ── Section Header ──────────────────────────────────
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  sectionTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitleDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.secondary,
  },
  sectionTitle: {
    fontFamily: FONTS.headline,
    fontSize: 17,
    color: COLORS.primary,
    letterSpacing: 0.1,
  },
  roomCount: {
    fontFamily: FONTS.label,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 1.2,
    marginTop: 2,
  },

  // ── Availability Pill Toggle ──────────────────────────────────
  pillToggle: {
    flexDirection: "row",
    backgroundColor: COLORS.inputBorder,
    borderRadius: 20,
    padding: 3,
    gap: 2,
  },
  pillOption: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 17,
  },
  pillOptionActive: {
    backgroundColor: COLORS.primary,
  },
  pillOptionText: {
    fontFamily: FONTS.label,
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 0.4,
  },
  pillOptionTextActive: {
    color: COLORS.neutral,
  },

  // ── Grid ──────────────────────────────────
  roomGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },

  // ── Empty State ──────────────────────────────────
  emptyState: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  emptyText: {
    fontFamily: FONTS.headlineReg,
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 6,
  },
  emptySubtext: {
    fontFamily: FONTS.bodyLight,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
  },
});

export default HomePage;
