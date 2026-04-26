import { useRef, useState } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  neutral: "#FFFFFF",
  background: "#F5F3EF",
  inputBorder: "#E0DDD8",
  textMuted: "#9A9690",
  textBody: "#3A3530",
};

/**
 * BookingDetailCard
 * Collapsible card showing booking summary — room image, nights, adults, price,
 * service fee and total. Reusable in CheckoutPage and ConfirmationPage.
 *
 * @param {object}  booking
 * @param {string}  booking.roomName
 * @param {any}     booking.image          - require() or { uri }
 * @param {number}  booking.nights
 * @param {number}  booking.adults
 * @param {number}  booking.roomTotal      - Room subtotal (price × nights)
 * @param {number}  booking.serviceFee
 * @param {string}  [booking.currency]     - Currency symbol, default "₱"
 * @param {boolean} [defaultExpanded]      - Start expanded, default true
 * @param {object}  [style]
 */
const BookingDetailCard = ({ booking, defaultExpanded = true, style }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const rotateAnim = useRef(
    new Animated.Value(defaultExpanded ? 1 : 0),
  ).current;
  const heightAnim = useRef(
    new Animated.Value(defaultExpanded ? 1 : 0),
  ).current;

  const currency = booking.currency ?? "₱";
  const total = booking.roomTotal + booking.serviceFee;

  const toggle = () => {
    const toValue = expanded ? 0 : 1;
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(heightAnim, {
        toValue,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();
    setExpanded((v) => !v);
  };

  const chevronRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View style={[styles.card, style]}>
      {/* ── Header (always visible) ── */}
      <TouchableOpacity
        style={styles.header}
        onPress={toggle}
        activeOpacity={0.8}
      >
        <Text style={styles.headerTitle}>Booking Details</Text>
        <Animated.Text
          style={[styles.chevron, { transform: [{ rotate: chevronRotate }] }]}
        >
          ∧
        </Animated.Text>
      </TouchableOpacity>

      {/* ── Collapsible body ── */}
      {expanded && (
        <View style={styles.body}>
          {/* Room row */}
          <View style={styles.roomRow}>
            {booking.image ? (
              <Image
                source={booking.image}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            ) : (
              // Placeholder — replace with <Image source={booking.image} />
              <View style={[styles.thumbnail, styles.thumbnailPlaceholder]} />
            )}
            <View style={styles.roomInfo}>
              <Text style={styles.roomName}>{booking.roomName}</Text>
              <Text style={styles.roomMeta}>
                {booking.nights} {booking.nights === 1 ? "Night" : "Nights"} •{" "}
                {booking.adults} {booking.adults === 1 ? "Adult" : "Adults"}
              </Text>
              <Text style={styles.roomPrice}>
                {currency}
                {booking.roomTotal.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Fee row */}
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Service Fee</Text>
            <Text style={styles.feeValue}>
              {currency}
              {booking.serviceFee.toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>

          {/* Total row */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>
              {currency}
              {total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.neutral,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  headerTitle: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 15,
    color: COLORS.primary,
  },
  chevron: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 16,
    color: COLORS.textMuted,
    lineHeight: 20,
  },

  // Body
  body: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    gap: 12,
  },

  // Room row
  roomRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  thumbnail: {
    width: 80,
    height: 70,
    borderRadius: 10,
  },
  thumbnailPlaceholder: {
    backgroundColor: "#2B4A6F",
  },
  roomInfo: {
    flex: 1,
    gap: 4,
  },
  roomName: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 14.5,
    color: COLORS.primary,
    lineHeight: 20,
  },
  roomMeta: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 12.5,
    color: COLORS.textMuted,
  },
  roomPrice: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 15,
    color: COLORS.secondary,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.inputBorder,
  },

  // Fee row
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  feeLabel: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 13.5,
    color: COLORS.textMuted,
  },
  feeValue: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 13.5,
    color: COLORS.textMuted,
  },

  // Total row
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 14.5,
    color: COLORS.primary,
  },
  totalValue: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 16,
    color: COLORS.primary,
  },
});

export default BookingDetailCard;
