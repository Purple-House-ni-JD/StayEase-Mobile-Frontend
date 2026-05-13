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
import CancellationModal from "../components/CancellationModal";
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
  info: "#1565C0",
  infoBg: "#E3F2FD",
  infoBorder: "#BBDEFB",
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

/** Format datetime string → "May 10, 2026 at 2:30 PM" */
const formatDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
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
const CANCELLABLE_STATUSES = ["pending"];

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
    <View style={styles.backBtn} />
  </View>
);

const HeroDateStrip = ({ checkIn, checkOut, nights }) => (
  <View style={styles.heroStrip}>
    <View style={styles.heroDateBlock}>
      <Text style={styles.heroDateLabel}>CHECK-IN</Text>
      <Text style={styles.heroDateValue}>{formatShortDate(checkIn)}</Text>
    </View>

    <View style={styles.heroNightsPill}>
      <Text style={styles.heroNightsNum}>{nights}</Text>
      <Text style={styles.heroNightsLabel}>
        {nights === 1 ? "Night" : "Nights"}
      </Text>
    </View>

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
  const [showCancelModal, setShowCancelModal] = useState(false);
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
    setShowCancelModal(true);
  };

  const confirmCancel = async (reason, notes) => {
    try {
      setIsCancelling(true);
      await cancelBooking(id, reason, notes);
      // Optimistically update local state so the UI reflects the change
      setBooking((prev) => ({
        ...prev,
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
        cancellation_notes: notes,
        cancellation_reason_display: getCancellationReasonDisplay(reason),
      }));
      Alert.alert(
        "Booking Cancelled",
        `Booking ${booking?.booking_ref} has been cancelled.`,
      );
      setShowCancelModal(false);
    } catch (err) {
      Alert.alert("Could not cancel", extractErrorMessage(err));
    } finally {
      setIsCancelling(false);
    }
  };

  const getCancellationReasonDisplay = (reasonValue) => {
    const reasons = {
      change_of_plans: "Change of Plans",
      found_better_deal: "Found Better Deal",
      booking_error: "Booking Error",
      travel_restrictions: "Travel Restrictions",
      emergency: "Emergency",
      weather_issues: "Weather Issues",
      other: "Other",
    };
    return reasons[reasonValue] || reasonValue;
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const isCancellable =
    booking && CANCELLABLE_STATUSES.includes(booking.status);
  const isCancelled = booking && booking.status === "cancelled";

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <HeaderBar onBack={() => router.back()} />

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
          {/* Reference + Status */}
          <View style={styles.refRow}>
            <View>
              <Text style={styles.refLabel}>Booking Reference</Text>
              <Text style={styles.refValue}>{booking.booking_ref}</Text>
            </View>
            <BookingStatusBadge status={booking.status} />
          </View>

          {/* Date strip */}
          <HeroDateStrip
            checkIn={booking.check_in}
            checkOut={booking.check_out}
            nights={booking.nights}
          />

          {/* Rooms */}
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

          {/* Stay Details */}
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

          {/* Payment */}
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

          {/* Cancellation Details - Only shown for cancelled bookings */}
          {isCancelled && (
            <SectionCard title="Cancellation Details">
              {booking.cancelled_at && (
                <BookingInfoRow
                  icon="⏰"
                  label="Cancelled On"
                  value={formatDateTime(booking.cancelled_at)}
                />
              )}
              {booking.cancellation_reason_display && (
                <BookingInfoRow
                  icon="❓"
                  label="Reason"
                  value={booking.cancellation_reason_display}
                />
              )}
              {booking.cancellation_notes &&
                booking.cancellation_notes.trim() !== "" && (
                  <View style={styles.cancellationNotesWrapper}>
                    <View style={styles.cancellationNotesHeader}>
                      <Text style={styles.cancellationNotesIcon}>📝</Text>
                      <Text style={styles.cancellationNotesLabel}>
                        Additional Notes
                      </Text>
                    </View>
                    <Text style={styles.cancellationNotesValue}>
                      {booking.cancellation_notes}
                    </Text>
                  </View>
                )}
              {!booking.cancellation_reason && !booking.cancellation_notes && (
                <View style={styles.noCancellationDetails}>
                  <Text style={styles.noCancellationDetailsText}>
                    No additional cancellation details available.
                  </Text>
                </View>
              )}
            </SectionCard>
          )}

          {/* Cancel button - only shown for cancellable statuses */}
          {isCancellable && (
            <View style={styles.cancelSection}>
              {isCancelling ? (
                <ActivityIndicator color={COLORS.danger} />
              ) : (
                <CancelButton onPress={handleCancel} />
              )}
              <Text style={styles.cancelHint}>
                Cancellations may be subject to the room&apos;s cancellation policy.
              </Text>
            </View>
          )}

          {/* Non-cancellable status message */}
          {booking && !isCancellable && !isCancelled && (
            <View style={styles.nonCancellableSection}>
              <Ionicons
                name="information-circle"
                size={24}
                color={COLORS.textMuted}
              />
              <Text style={styles.nonCancellableText}>
                This booking cannot be cancelled as it is already{" "}
                {booking.status}.
              </Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </Animated.ScrollView>
      )}

      {/* Cancellation Modal */}
      <CancellationModal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancel}
        bookingRef={booking?.booking_ref}
        isLoading={isCancelling}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header bar
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
  headerTitle: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 17,
    color: COLORS.primary,
    letterSpacing: 0.2,
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // Reference row
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

  // Hero date strip
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

  // Section / room card
  roomCardSpacing: {
    marginVertical: 8,
  },

  // Info row overrides
  lastRow: {
    borderBottomWidth: 0,
  },

  // Payment section
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

  // Total row
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

  // Cancellation Notes
  cancellationNotesWrapper: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  cancellationNotesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cancellationNotesIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  cancellationNotesLabel: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 13,
    color: COLORS.primary,
  },
  cancellationNotesValue: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 13.5,
    color: COLORS.textBody,
    lineHeight: 20,
    paddingLeft: 24,
  },
  noCancellationDetails: {
    paddingVertical: 16,
    alignItems: "center",
  },
  noCancellationDetailsText: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: "italic",
  },

  // Cancel section
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

  // Non-cancellable section
  nonCancellableSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.infoBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.infoBorder,
  },
  nonCancellableText: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 13,
    color: COLORS.info,
    flex: 1,
    textAlign: "center",
  },

  // Loading / Error
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
