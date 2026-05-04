import { useEffect, useRef, useState, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

// ── Reusable components ───────────────────────────────────────────────────────
import BottomNavBar from "../components/BottomNavBar";
import RoomCard from "../components/RoomCard";
import { COLORS } from "../constants/colors";
import { NAV_TABS, navigateToTab } from "../constants/navigation";
import { getWishlist, removeFromWishlist } from "@/services/wishlistService";
import { extractErrorMessage } from "@/lib/errorUtils";
import TopBar from "../components/TopBar";
import { useAuth } from "@/context/AuthContext";
import AuthRequiredPrompt from "../components/AuthRequiredPrompt";
import useRoomStore from "../store/useRoomStore";

// ─── Main Component ───────────────────────────────────────────────────────────
const WishlistPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("wishlist");
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Room store
  const rooms = useRoomStore((state) => state.rooms);
  const hydrateRooms = useRoomStore((state) => state.hydrateRooms);

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Ensure rooms are hydrated
        await hydrateRooms();

        const data = await getWishlist();

        const raw = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : [];

        setWishlistItems(raw);
      } catch (err) {
        setError(extractErrorMessage(err));
        Alert.alert("Could not load wishlist", extractErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();
  }, [hydrateRooms]);

  // Filter rooms based on wishlist items
  const wishlistRooms = useMemo(() => {
    const wishlistRoomIds = wishlistItems.map((item) => String(item.room?.id));
    return rooms.filter((room) => wishlistRoomIds.includes(String(room.id)));
  }, [wishlistItems, rooms]);

  // Entry animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 420,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleNavSelect = (id) => {
    setActiveNav(id);
    navigateToTab(router, id);
  };

  const handleRoomPress = (room) => {
    router.push(`/rooms/${room.id}`);
  };

  const handleRemoveFromWishlist = async (room) => {
    try {
      await removeFromWishlist(room.id);
      setWishlistItems((prev) =>
        prev.filter((w) => String(w.room?.id) !== String(room.id)),
      );
      Alert.alert("Success", "Room removed from wishlist");
    } catch (err) {
      Alert.alert("Error", extractErrorMessage(err));
    }
  };

  // Show authentication prompt if user is not logged in
  if (!user) {
    return <AuthRequiredPrompt featureName="your wishlist" />;
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      {/* ── Navbar ── */}
      <TopBar
        user={user}
        onMenuPress={() => console.log("Menu pressed")}
        onAvatarPress={() => console.log("Avatar pressed")}
      />

      {/* ── Page Header ── */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>My Wishlist</Text>
        <Text style={styles.subtitle}>
          {wishlistRooms.length} {wishlistRooms.length === 1 ? "room" : "rooms"}{" "}
          saved
        </Text>
      </View>

      {/* ── Content ── */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading wishlist…</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <Animated.ScrollView
          style={[
            styles.scroll,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {wishlistRooms.length === 0 ? (
            <EmptyState />
          ) : (
            wishlistRooms.map((room) => (
              <RoomCard
                key={room.id}
                item={room}
                onPress={() => handleRoomPress(room)}
                onRemove={() => handleRemoveFromWishlist(room)}
                isInWishlist={true}
                cardWidth="100%"
              />
            ))
          )}
        </Animated.ScrollView>
      )}

      {/* ── Bottom Navigation ── */}
      <BottomNavBar
        tabs={NAV_TABS}
        activeId={activeNav}
        onSelect={handleNavSelect}
      />
    </View>
  );
};

// ── Empty State Component ─────────────────────────────────────────────────────
const EmptyState = () => {
  const router = useRouter();

  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>❤️</Text>
      <Text style={styles.emptyTitle}>No saved rooms yet</Text>
      <Text style={styles.emptySubtitle}>
        Start exploring and save your favorite rooms for later
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigateToTab(router, "home")}
      >
        <Text style={styles.exploreButtonText}>Explore Rooms</Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: "400",
  },
  scroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 120, // Space for bottom nav
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: "center",
    fontWeight: "500",
  },
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.dark,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default WishlistPage;
