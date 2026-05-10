import { useRef, useEffect, useState } from "react";
import {
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

// ── Reusable components ───────────────────────────────────────────────────────
import ConfirmationHeader from "../components/ConfirmationHeader";
import BookingTicketCard from "../components/BookingTicketCard";
import HotelSummaryCard from "../components/HotelSummaryCard";
import { GoldButton, GhostButton } from "../components/ActionButtons";
import TopBar from "../components/TopBar";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  neutral: "#FFFFFF",
  background: "#0A1D37", // dark page background for confirmation screens
  textMuted: "#9A9690",
};

// ─── Utility Functions ───────────────────────────────────────────────────────────
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ConfirmationPage = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Staggered entry animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    // Parse booking data from route params
    if (params.bookingData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(params.bookingData));
        setBookingData(parsedData);
      } catch (error) {
        // Invalid booking data in route params
      }
    }
    setLoading(false);
  }, [params.bookingData]);

  useEffect(() => {
    // Start animation when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Show loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading booking details...</Text>
        </View>
      </View>
    );
  }

  // Show error state if no booking data
  if (!bookingData) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Booking information not found</Text>
          <GhostButton
            label="Back to Home"
            onPress={() => router.push("/")}
            style={styles.errorButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <TopBar />

      <Animated.ScrollView
        style={[
          styles.scroll,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Success Header ── */}
        <ConfirmationHeader
          icon="✓"
          eyebrow="TRANSACTION SUCCESSFUL"
          title={"Booking\nConfirmed!"}
          subtitle="Your luxury stay has been successfully reserved. We look forward to your visit."
        />

        {/* ── Booking Ticket ── */}
        <BookingTicketCard
          reference={bookingData.booking_ref || bookingData.reference}
          guestName={
            bookingData.guest_name ||
            `${bookingData.user?.first_name || ""} ${bookingData.user?.last_name || ""}`.trim() ||
            "Guest"
          }
          roomType={bookingData.room?.name || bookingData.room_type || "Room"}
          checkIn={formatDate(bookingData.check_in)}
          checkOut={formatDate(bookingData.check_out)}
          style={styles.ticket}
        />

        {/* ── CTAs ── */}
        <GoldButton
          label="View My Bookings"
          onPress={() => router.push("pages/BookingsPage")}
          style={styles.primaryCta}
        />

        <GhostButton
          label="🏠  Back to Home"
          onPress={() => router.push("/")}
          style={styles.secondaryCta}
        />

        {/* ── Hotel Summary ── */}
        <HotelSummaryCard
          // imageSource={bookingData.room?.image_urls?.[0] ? { uri: bookingData.room.image_urls[0] } : null}
          hotelName={bookingData.room?.name || "StayEase Property"}
          location={bookingData.room?.location || "Philippines"}
          amountPaid={bookingData.total_price || bookingData.amountPaid || 0}
          currency="₱"
          status="PAID"
          style={styles.hotelCard}
        />

        {/* ── Help Footer ── */}
        <HelpFooter style={styles.footer} />

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </View>
  );
};

// ─── Help Footer ─────────────────────────────────────────────────────────────
/**
 * HelpFooter
 * Small help text with concierge + cancellation policy links.
 * Kept local — only used at the bottom of confirmation-type screens.
 */
const HelpFooter = ({ style }) => (
  <View style={[footerStyles.container, style]}>
    <Text style={footerStyles.question}>Need help with your booking?</Text>
    <View style={footerStyles.linksRow}>
      <TouchableOpacity activeOpacity={0.7}>
        <Text style={footerStyles.link}>Contact Concierge</Text>
      </TouchableOpacity>
      <View style={footerStyles.dot} />
      <TouchableOpacity activeOpacity={0.7}>
        <Text style={footerStyles.link}>Cancellation Policy</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const footerStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 8,
  },
  question: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 12.5,
    color: "rgba(255,255,255,0.35)",
    marginBottom: 8,
  },
  linksRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  link: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 12.5,
    color: COLORS.secondary,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Navbar
  navbar: {
    backgroundColor: COLORS.background,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 52,
    paddingBottom: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 20,
    color: COLORS.secondary,
    lineHeight: 24,
  },
  navBrand: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 20,
    color: COLORS.secondary,
    letterSpacing: 0.5,
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "rgba(197,160,89,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarIcon: {
    fontSize: 16,
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  // Content spacing
  ticket: {
    marginBottom: 24,
  },
  primaryCta: {
    marginBottom: 14,
  },
  secondaryCta: {
    marginBottom: 28,
  },
  hotelCard: {
    marginBottom: 32,
  },
  footer: {
    marginBottom: 8,
  },

  // Loading and error states
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    marginBottom: 20,
  },
  errorButton: {
    marginTop: 10,
  },
});

export default ConfirmationPage;
