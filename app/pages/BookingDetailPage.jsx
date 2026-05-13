/**
 * BookingDetailPage
 *
 * Displays the full detail of a single booking.
 * Route: pages/BookingDetailPage?id=<bookingId>
 *
 * API response shape (BookingDetailSerializer):
 * {
 *   id, booking_ref, check_in, check_out, nights, guest_count,
 *   total_price, status, is_featured, created_at,
 *   payment_status, payment_method,
 *   booking_rooms: [{
 *     id, price_snapshot,
 *     room: { id, name, category, category_display, price_per_night,
 *             max_guest, rating, image_urls }
 *   }]
 * }
 */

import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

// ── Services ──────────────────────────────────────────────────────────────────
import { getBookingDetail, cancelBooking } from "@/services/bookingService";
import { extractErrorMessage } from "@/lib/errorUtils";

// ── Components ────────────────────────────────────────────────────────────────
import BookingStatusBadge from "../components/BookingStatusBadge";
import BookingRoomCard from "../components/BookingRoomCard";
import BookingInfoRow from "../components/BookingInfoRow";
import SectionCard from "../components/SectionCard";
import PaymentMethodBadge from "../components/PaymentMethodBadge";
import { Ionicons } from "@expo/vector-icons";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  neutral: "#FFFFFF",
  background: "#F5F3EF",
  textMuted: "#9A9690",
  textBody: "#3A3530",
  inputBorder: "#E0DDD8",
  danger: "#C0392B",
  dangerBg: "#FDF0EF",
  dangerBorder: "#F5C6C2",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format "YYYY-MM-DD" → "May 10, 2026" */
const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
};

/** Format "HH:MM:SS" → "2:00 PM" */
const formatTime = (timeString) => {
  if (!timeString) return "—";
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

/** Format "YYYY-MM-DD" → "Mon, May 10" */
const formatShortDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
};

const PAYMENT_STATUS_LABEL = {
  pending: "Awaiting Payment",
  paid: "Paid",
  failed: "Payment Failed",
  refunded: "Refunded",
};

const PAYMENT_STATUS_COLOR = {
  pending: "#B07800",
  paid: "#2E7D32",
  failed: COLORS.danger,
  refunded: "#1565C0",
};

/** Statuses that allow guest self-cancellation */
const CANCELLABLE_STATUSES = ["pending", "confirmed"];

// ─── Sub-components ───────────────────────────────────────────────────────────

const HeaderBar = ({ onBack }) => (
  <View style={styles.headerBar}>
    <TouchableOpacity
      onPress={onBack}
      style={styles.backBtn}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={24} color="black" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Booking Detail</Text>
    {/* Spacer keeps title centred */}
    <View style={styles.backBtn} />
  </View>
);

const HeroDateStrip = ({ checkIn, checkOut, nights }) => (
  <View style={styles.heroStrip}>
    {/* Check-in */}
    <View style={styles.heroDateBlock}>
      <Text style={styles.heroDateLabel}>CHECK-IN</Text>
      <Text style={styles.heroDateValue}>{formatShortDate(checkIn)}</Text>
    </View>

    {/* Nights pill */}
    <View style={styles.heroNightsPill}>
      <Text style={styles.heroNightsNum}>{nights}</Text>
      <Text style={styles.heroNightsLabel}>
        {nights === 1 ? "Night" : "Nights"}
      </Text>
    </View>

    {/* Check-out */}
    <View style={[styles.heroDateBlock, styles.heroDateRight]}>
      <Text style={styles.heroDateLabel}>CHECK-OUT</Text>
      <Text style={styles.heroDateValue}>{formatShortDate(checkOut)}</Text>
    </View>
  </View>
);

const TotalPriceRow = ({ total }) => {
  const formatted = parseFloat(total).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (
    <View style={styles.totalRow}>
      <Text style={styles.totalLabel}>Total Amount</Text>
      <Text style={styles.totalValue}>₱{formatted}</Text>
    </View>
  );
};

const CancelButton = ({ onPress }) => (
  <TouchableOpacity
    style={styles.cancelBtn}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={styles.cancelBtnText}>Cancel Booking</Text>
  </TouchableOpacity>
);

// ─── Loading / Error states ───────────────────────────────────────────────────

const LoadingView = () => (
  <View style={styles.centered}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={styles.loadingText}>Loading booking…</Text>
  </View>
);

const ErrorView = ({ message, onRetry }) => (
  <View style={styles.centered}>
    <Text style={styles.errorIcon}>⚠️</Text>
    <Text style={styles.errorText}>{message}</Text>
    <TouchableOpacity
      style={styles.retryBtn}
      onPress={onRetry}
      activeOpacity={0.8}
    >
      <Text style={styles.retryBtnText}>Try Again</Text>
    </TouchableOpacity>
  </View>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const BookingDetailPage = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState(null);

  // Entry animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  const runEntryAnim = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(24);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadBooking = async () => {
    if (!id) {
      setError("No booking ID provided.");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const data = await getBookingDetail(id);
      setBooking(data);
      runEntryAnim();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBooking();
  }, [id]);

  // ── Cancel handler ─────────────────────────────────────────────────────────
  const handleCancel = () => {
    Alert.alert(
      "Cancel Booking",
      `Are you sure you want to cancel booking ${booking?.booking_ref}? This action cannot be undone.`,
      [
        { text: "Keep Booking", style: "cancel" },
        {
          text: "Cancel Booking",
          style: "destructive",
          onPress: confirmCancel,
        },
      ],
    );
  };

  const confirmCancel = async () => {
    try {
      setIsCancelling(true);
      await cancelBooking(id);
      // Optimistically update local state so the UI reflects the change
      setBooking((prev) => ({ ...prev, status: "cancelled" }));
      Alert.alert(
        "Booking Cancelled",
        `Booking ${booking?.booking_ref} has been cancelled.`,
      );
    } catch (err) {
      Alert.alert("Could not cancel", extractErrorMessage(err));
    } finally {
      setIsCancelling(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const isCancellable =
    booking && CANCELLABLE_STATUSES.includes(booking.status);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <HeaderBar onBack={() => router.back()} />

      {/* ── Content ── */}
      {isLoading ? (
        <LoadingView />
      ) : error ? (
        <ErrorView message={error} onRetry={loadBooking} />
      ) : (
        <Animated.ScrollView
          style={[
            styles.scroll,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── Reference + Status ── */}
          <View style={styles.refRow}>
            <View>
              <Text style={styles.refLabel}>Booking Reference</Text>
              <Text style={styles.refValue}>{booking.booking_ref}</Text>
            </View>
            <BookingStatusBadge status={booking.status} />
          </View>

          {/* ── Date strip ── */}
          <HeroDateStrip
            checkIn={booking.check_in}
            checkOut={booking.check_out}
            nights={booking.nights}
          />

          {/* ── Rooms ── */}
          <SectionCard title="Room(s)">
            {(booking.booking_rooms ?? []).map((br) => (
              <BookingRoomCard
                key={br.id}
                bookingRoom={br}
                nights={booking.nights}
                style={styles.roomCardSpacing}
              />
            ))}
          </SectionCard>

          {/* ── Stay Details ── */}
          <SectionCard title="Stay Details">
            <BookingInfoRow
              icon="📅"
              label="Check-in"
              value={formatDate(booking.check_in)}
            />
            {booking.checkin_time && (
              <BookingInfoRow
                icon="🕑"
                label="Check-in Time"
                value={formatTime(booking.checkin_time)}
              />
            )}
            <BookingInfoRow
              icon="📅"
              label="Check-out"
              value={formatDate(booking.check_out)}
            />
            {booking.checkout_time && (
              <BookingInfoRow
                icon="🕑"
                label="Check-out Time"
                value={formatTime(booking.checkout_time)}
              />
            )}
            {booking.estimated_arrival_time && (
              <BookingInfoRow
                icon="🚗"
                label="Estimated Arrival"
                value={formatTime(booking.estimated_arrival_time)}
              />
            )}
            <BookingInfoRow
              icon="🌙"
              label="Nights"
              value={`${booking.nights} night${booking.nights !== 1 ? "s" : ""}`}
            />
            <BookingInfoRow
              icon="👥"
              label="Guests"
              value={`${booking.guest_count} guest${booking.guest_count !== 1 ? "s" : ""}`}
            />
            <BookingInfoRow
              icon="🗓"
              label="Booked on"
              value={formatDate(booking.created_at)}
              style={styles.lastRow}
            />
          </SectionCard>

          {/* ── Payment ── */}
          <SectionCard title="Payment">
            <BookingInfoRow
              icon="💰"
              label="Payment Status"
              value={
                PAYMENT_STATUS_LABEL[booking.payment_status] ??
                booking.payment_status ??
                "—"
              }
              valueStyle={{
                color:
                  PAYMENT_STATUS_COLOR[booking.payment_status] ??
                  COLORS.textBody,
              }}
            />
            <View style={styles.paymentMethodRow}>
              <Text style={styles.paymentMethodLabel}>Method</Text>
              {booking.payment_method ? (
                <PaymentMethodBadge method={booking.payment_method} />
              ) : (
                <Text style={styles.paymentMethodNone}>—</Text>
              )}
            </View>
            <TotalPriceRow total={booking.total_price} />
          </SectionCard>

          {/* ── Cancel button — only shown for cancellable statuses ── */}
          {isCancellable && (
            <View style={styles.cancelSection}>
              {isCancelling ? (
                <ActivityIndicator color={COLORS.danger} />
              ) : (
                <CancelButton onPress={handleCancel} />
              )}
              <Text style={styles.cancelHint}>
                Cancellations may be subject to the room&rsquo;s cancellation
                policy.
              </Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </Animated.ScrollView>
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ── Header bar ──
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 12,
    backgroundColor: COLORS.background,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    fontSize: 22,
    color: COLORS.primary,
  },
  headerTitle: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 17,
    color: COLORS.primary,
    letterSpacing: 0.2,
  },

  // ── Scroll ──
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // ── Reference row ──
  refRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  refLabel: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 11.5,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  refValue: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 20,
    color: COLORS.primary,
    letterSpacing: 0.3,
  },

  // ── Hero date strip ──
  heroStrip: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  heroDateBlock: {
    flex: 1,
  },
  heroDateRight: {
    alignItems: "flex-end",
  },
  heroDateLabel: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 9,
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  heroDateValue: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 14,
    color: COLORS.neutral,
  },
  heroNightsPill: {
    backgroundColor: COLORS.secondary,
    borderRadius: 30,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: "center",
    minWidth: 64,
  },
  heroNightsNum: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 22,
    color: COLORS.primary,
    lineHeight: 26,
  },
  heroNightsLabel: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 10,
    color: COLORS.primary,
  },

  // ── Section / room card ──
  roomCardSpacing: {
    marginVertical: 8,
  },

  // ── Info row overrides ──
  lastRow: {
    borderBottomWidth: 0,
  },

  // ── Payment section ──
  paymentMethodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  paymentMethodLabel: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 13.5,
    color: COLORS.textMuted,
  },
  paymentMethodNone: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 13.5,
    color: COLORS.primary,
  },

  // ── Total row ──
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  totalLabel: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 15,
    color: COLORS.primary,
  },
  totalValue: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 20,
    color: COLORS.secondary,
  },

  // ── Cancel section ──
  cancelSection: {
    marginTop: 4,
    marginBottom: 8,
    alignItems: "center",
    gap: 10,
  },
  cancelBtn: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: COLORS.dangerBg,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    alignItems: "center",
  },
  cancelBtnText: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 14.5,
    color: COLORS.danger,
    letterSpacing: 0.3,
  },
  cancelHint: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: "center",
    paddingHorizontal: 16,
  },

  // ── Loading / Error ──
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 32,
  },
  loadingText: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14,
    color: COLORS.textMuted,
  },
  errorIcon: {
    fontSize: 36,
  },
  errorText: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14,
    color: COLORS.danger,
    textAlign: "center",
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: 28,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  retryBtnText: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 14,
    color: COLORS.neutral,
  },
});

export default BookingDetailPage;
