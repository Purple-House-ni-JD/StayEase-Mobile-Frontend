import { useEffect, useRef, useState } from "react";
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
import FilterTabBar from "../components/FilterTabBar";
import BookingCard from "../components/BookingCard";
import BottomNavBar from "../components/BottomNavBar";
import { COLORS } from "../constants/colors";
import { NAV_TABS, navigateToTab } from "../constants/navigation";
import { FILTER_TABS } from "../constants/mockData";
import { getMyBookings } from "@/services/bookingService";
import { extractErrorMessage } from "@/lib/errorUtils";
import TopBar from "../components/TopBar";
import { useAuth } from "@/context/AuthContext";
import AuthRequiredPrompt from "../components/AuthRequiredPrompt";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Map a raw booking object from the backend to the shape BookingCard expects.
 *
 * Backend BookingListSerializer fields:
 *   id, booking_ref, user_email, check_in, check_out,
 *   nights, guest_count, total_price, status, created_at
 *
 * NOTE: The list endpoint does NOT include booking_rooms (that's on the detail
 * endpoint). We use booking_ref as the display title and show it as reference
 * too — or you can hit the detail endpoint per booking if you need room names.
 */
const mapBooking = (booking) => {
  const statusMap = {
    pending: "pending",
    confirmed: "active",
    completed: "completed", // completed stays get their own status
    cancelled: "cancelled",
  };

  // Format dates from "YYYY-MM-DD" → "May 10 — May 15"
  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return isNaN(d.getTime())
      ? iso
      : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return {
    id: String(booking.id),
    roomName: `Booking #${booking.booking_ref}`,
    reference: booking.booking_ref,
    dateRange: `${formatDate(booking.check_in)} — ${formatDate(booking.check_out)}`,
    amount: parseFloat(booking.total_price) || 0, // FIX: backend sends decimal string
    currency: "₱", // FIX: was "$ " which overrode the ₱ default
    status: statusMap[booking.status] ?? "pending",
    imageSource: null, // list endpoint has no images; detail endpoint would have them
    nights: booking.nights,
    guests: booking.guest_count,
  };
};

// ─── Main Component ───────────────────────────────────────────────────────────
const BookingsPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeNav, setActiveNav] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getMyBookings();

        const raw = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : [];

        setBookings(raw.map(mapBooking));
      } catch (err) {
        setError(extractErrorMessage(err));
        Alert.alert("Could not load bookings", extractErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, []);

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
  }, []);

  // Filter bookings based on active tab
  const filtered =
    activeFilter === "all"
      ? bookings
      : bookings.filter((b) => b.status === activeFilter);

  const handleNavSelect = (id) => {
    setActiveNav(id);
    navigateToTab(router, id);
  };

  const handleBookingPress = (booking) => {
    router.push(`pages/BookingDetailPage?id=${booking.id}`);
  };

  // Show authentication prompt if user is not logged in
  if (!user) {
    return <AuthRequiredPrompt featureName="your booking history" />;
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

      {/* ── Page Header + Filter ── */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>My Bookings</Text>
        <FilterTabBar
          tabs={FILTER_TABS}
          activeId={activeFilter}
          onSelect={setActiveFilter}
          style={styles.filterBar}
        />
      </View>

      {/* ── Content ── */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading bookings…</Text>
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
          {filtered.length === 0 ? (
            <EmptyState filter={activeFilter} />
          ) : (
            filtered.map((booking) => (
              <BookingCard
                key={booking.id}
                roomName={booking.roomName}
                reference={booking.reference}
                dateRange={booking.dateRange}
                amount={booking.amount}
                currency={booking.currency}
                status={booking.status}
                imageSource={booking.imageSource}
                onPress={() => handleBookingPress(booking)}
                style={styles.card}
              />
            ))
          )}
          <View style={{ height: 20 }} />
        </Animated.ScrollView>
      )}

      {/* ── Bottom Nav ── */}
      <BottomNavBar
        tabs={NAV_TABS}
        activeId={activeNav}
        onSelect={handleNavSelect}
      />
    </View>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ filter }) => (
  <View style={emptyStyles.container}>
    <Text style={emptyStyles.icon}>🛎</Text>
    <Text style={emptyStyles.title}>No {filter} bookings</Text>
    <Text style={emptyStyles.subtitle}>
      Your {filter === "all" ? "" : filter + " "}reservations will appear here.
    </Text>
  </View>
);

const emptyStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  icon: {
    fontSize: 40,
    marginBottom: 16,
  },
  title: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 18,
    color: COLORS.primary,
    marginBottom: 8,
    textTransform: "capitalize",
  },
  subtitle: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 13.5,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Centered loading / error
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14,
    color: COLORS.textMuted,
  },
  errorText: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14,
    color: "#C0392B",
    textAlign: "center",
    paddingHorizontal: 32,
  },

  // Navbar
  navbar: {
    backgroundColor: COLORS.background,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 8,
  },
  menuBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    gap: 5,
  },
  menuLine: {
    height: 2,
    width: 22,
    backgroundColor: COLORS.primary,
    borderRadius: 1,
  },
  menuLineMid: {
    width: 16,
  },
  navBrand: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 3,
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: COLORS.primary,
  },
  avatarCircle: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.background,
  },
  pageTitle: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 28,
    color: COLORS.primary,
    marginBottom: 16,
    lineHeight: 34,
  },
  filterBar: {
    paddingBottom: 2,
  },

  // List
  scroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  card: {
    // margin handled by gap
  },
});

export default BookingsPage;
