import { useRef } from "react";
import {
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

// ── Reusable components ───────────────────────────────────────────────────────
import ConfirmationHeader from "../components/ConfirmationHeader";
import BookingTicketCard from "../components/BookingTicketCard";
import HotelSummaryCard from "../components/HotelSummaryCard";
import { GoldButton, GhostButton } from "../components/ActionButtons";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  neutral: "#FFFFFF",
  background: "#0A1D37", // dark page background for confirmation screens
  textMuted: "#9A9690",
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
// TODO: Replace with route params passed from CheckoutPage after successful POST
const MOCK_CONFIRMATION = {
  reference: "SE-9420815",
  guestName: "Julian Thorne",
  roomType: "Executive Suite",
  checkIn: "Oct 24, 2023",
  checkOut: "Oct 28, 2023",
  hotelName: "The Ritz-Carlton, Paris",
  hotelLocation: "Place Vendôme, Paris",
  // hotelImage: require("../../assets/images/ritz-paris.png"),
  amountPaid: 2450.0,
  currency: "€",
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ConfirmationPage = () => {
  const router = useRouter();

  // Staggered entry animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;

  useRef(
    (() => {
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
    })(),
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* ── Custom Navbar ── */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navBrand}>StayEase</Text>
        <TouchableOpacity style={styles.avatarBtn} activeOpacity={0.8}>
          <Text style={styles.avatarIcon}>👤</Text>
        </TouchableOpacity>
      </View>

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
          reference={MOCK_CONFIRMATION.reference}
          guestName={MOCK_CONFIRMATION.guestName}
          roomType={MOCK_CONFIRMATION.roomType}
          checkIn={MOCK_CONFIRMATION.checkIn}
          checkOut={MOCK_CONFIRMATION.checkOut}
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
          // imageSource={MOCK_CONFIRMATION.hotelImage}
          hotelName={MOCK_CONFIRMATION.hotelName}
          location={MOCK_CONFIRMATION.hotelLocation}
          amountPaid={MOCK_CONFIRMATION.amountPaid}
          currency={MOCK_CONFIRMATION.currency}
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
});

export default ConfirmationPage;
