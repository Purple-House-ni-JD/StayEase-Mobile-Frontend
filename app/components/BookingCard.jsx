import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  neutral: "#FFFFFF",
  background: "#F5F3EF",
  textMuted: "#9A9690",
  textBody: "#3A3530",
  inputBorder: "#E0DDD8",
};

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  active: {
    label: "ACTIVE",
    backgroundColor: COLORS.secondary,
    textColor: COLORS.primary,
  },
  pending: {
    label: "PENDING",
    backgroundColor: COLORS.primary,
    textColor: COLORS.neutral,
  },
  cancelled: {
    label: "CANCELLED",
    backgroundColor: "#E5E3DE",
    textColor: COLORS.textMuted,
  },
};

/**
 * BookingCard
 *
 * A single booking list item: thumbnail left accent bar, room name,
 * reference number, date range, total amount, and a status badge.
 *
 * Props:
 *  - id           {string}              Booking ID (key)
 *  - imageSource  {ImageSourcePropType} require(…) or { uri: "…" }
 *  - roomName     {string}              e.g. "Royal Penthouse Suite"
 *  - reference    {string}              e.g. "SE-882109"
 *  - dateRange    {string}              Pre-formatted: "Oct 12 — Oct 15"
 *  - amount       {number|string}       e.g. 1240 or "1,240"
 *  - currency     {string}              e.g. "$" or "₱"  (default "₱")
 *  - status       {"active"|"pending"|"cancelled"}
 *  - onPress      {function}            Navigate to booking detail
 *  - style        {object}              Extra styles on the wrapper
 */
const BookingCard = ({
  imageSource,
  roomName,
  reference,
  dateRange,
  amount,
  currency = "₱",
  status = "active",
  onPress,
  style,
}) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.active;
  const isCancelled = status === "cancelled";

  const formattedAmount =
    typeof amount === "number"
      ? amount.toLocaleString("en-PH", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
      : amount;

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      {/* ── Left gold accent bar (active/pending) or grey (cancelled) ── */}
      <View
        // style={[
        //   styles.accentBar,
        //   {
        //     backgroundColor: isCancelled
        //       ? COLORS.inputBorder
        //       : COLORS.secondary,
        //   },
        // ]}
      />

      {/* ── Thumbnail ── */}
      {imageSource ? (
        <Image
          source={imageSource}
          style={[styles.thumbnail, isCancelled && styles.thumbnailDimmed]}
        />
      ) : (
        <View
          style={[
            styles.thumbnailPlaceholder,
            isCancelled && styles.thumbnailDimmed,
          ]}
        >
          <Text style={styles.thumbnailEmoji}>🛏</Text>
        </View>
      )}

      {/* ── Content ── */}
      <View style={styles.content}>
        {/* Top row: room name + badge */}
        <View style={styles.topRow}>
          <Text
            style={[styles.roomName, isCancelled && styles.textDimmed]}
            numberOfLines={2}
          >
            {roomName}
          </Text>
          <StatusBadge
            label={cfg.label}
            bg={cfg.backgroundColor}
            color={cfg.textColor}
          />
        </View>

        {/* Reference */}
        <Text style={[styles.reference, isCancelled && styles.textDimmed]}>
          Ref: {reference}
        </Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Bottom row: dates + amount */}
        <View style={styles.bottomRow}>
          <View style={styles.dateRow}>
            <Text style={styles.calIcon}>📅</Text>
            <Text style={[styles.dateText, isCancelled && styles.textDimmed]}>
              {dateRange}
            </Text>
          </View>
          <Text
            style={[
              styles.amount,
              isCancelled ? styles.textDimmed : styles.amountActive,
            ]}
          >
            {currency}
            {formattedAmount}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ── Status badge pill ───────────────────────────────────────────────────────
const StatusBadge = ({ label, bg, color }) => (
  <View style={[badgeStyles.pill, { backgroundColor: bg }]}>
    <Text style={[badgeStyles.text, { color }]}>{label}</Text>
  </View>
);

const badgeStyles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
    flexShrink: 0,
  },
  text: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 9.5,
    letterSpacing: 0.8,
  },
});

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.neutral,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  // Accent
  accentBar: {
    width: 4,
    alignSelf: "stretch",
  },

  // Thumbnail
  thumbnail: {
    width: 100,
    height: "100%",
    minHeight: 120,
  },
  thumbnailPlaceholder: {
    width: 100,
    minHeight: 120,
    backgroundColor: "#E8E6E1",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbnailEmoji: {
    fontSize: 28,
  },
  thumbnailDimmed: {
    opacity: 0.5,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 4,
  },
  roomName: {
    flex: 1,
    fontFamily: "NotoSerif-Bold",
    fontSize: 15,
    color: COLORS.primary,
    lineHeight: 20,
  },
  reference: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginBottom: 10,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: COLORS.inputBorder,
    marginBottom: 10,
  },

  // Bottom row
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  calIcon: {
    fontSize: 11,
  },
  dateText: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 12,
    color: COLORS.textBody,
  },
  amount: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 15,
  },
  amountActive: {
    color: COLORS.secondary,
  },

  // Dimmed state for cancelled
  textDimmed: {
    color: COLORS.textMuted,
  },
});

export default BookingCard;
