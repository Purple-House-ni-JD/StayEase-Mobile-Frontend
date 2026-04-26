import { Image, StyleSheet, Text, View } from "react-native";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  neutral: "#FFFFFF",
  textMuted: "#9A9690",
  textBody: "#3A3530",
};

/**
 * HotelSummaryCard
 *
 * A compact card summarising the property and total amount paid.
 * Suitable for order confirmations, receipts, and booking history items.
 *
 * Props:
 *  - imageSource  {ImageSourcePropType}  require(…) or { uri: "…" }
 *  - hotelName    {string}               e.g. "The Ritz-Carlton, Paris"
 *  - location     {string}               e.g. "Place Vendôme, Paris"
 *  - amountPaid   {number|string}        numeric or pre-formatted, e.g. 2450 or "2,450.00"
 *  - currency     {string}               symbol, e.g. "₱" or "€"   (default "₱")
 *  - status       {string}               badge text                  (default "PAID")
 *  - statusColor  {string}               badge background            (default green)
 *  - style        {object}               extra styles on the wrapper
 */
const HotelSummaryCard = ({
  imageSource,
  hotelName,
  location,
  amountPaid,
  currency = "₱",
  status = "PAID",
  statusColor = "#16A34A",
  style,
}) => {
  // Format numeric amounts → "2,450.00"
  const formattedAmount =
    typeof amountPaid === "number"
      ? amountPaid.toLocaleString("en-PH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : amountPaid;

  return (
    <View style={[styles.card, style]}>
      {/* ── Hotel Row ── */}
      <View style={styles.hotelRow}>
        {imageSource ? (
          <Image source={imageSource} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Text style={styles.thumbnailEmoji}>🏨</Text>
          </View>
        )}

        <View style={styles.hotelInfo}>
          <Text style={styles.hotelName} numberOfLines={2}>
            {hotelName}
          </Text>
          {location ? (
            <View style={styles.locationRow}>
              <Text style={styles.locationPin}>📍</Text>
              <Text style={styles.locationText} numberOfLines={1}>
                {location}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* ── Divider ── */}
      <View style={styles.divider} />

      {/* ── Amount + Status ── */}
      <View style={styles.amountRow}>
        <View>
          <Text style={styles.amountLabel}>AMOUNT PAID</Text>
          <Text style={styles.amountValue}>
            {currency}
            {formattedAmount}
          </Text>
        </View>
        <StatusBadge label={status} backgroundColor={statusColor} />
      </View>
    </View>
  );
};

// ── Small pill badge ────────────────────────────────────────────────────────
const StatusBadge = ({ label, backgroundColor }) => (
  <View style={[badgeStyles.pill, { backgroundColor }]}>
    <Text style={badgeStyles.text}>{label}</Text>
  </View>
);

const badgeStyles = StyleSheet.create({
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  text: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 11,
    color: "#FFFFFF",
    letterSpacing: 0.8,
  },
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 16,
  },

  // Hotel info row
  hotelRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  thumbnailPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbnailEmoji: {
    fontSize: 26,
  },
  hotelInfo: {
    flex: 1,
  },
  hotelName: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 15,
    color: "#FFFFFF",
    lineHeight: 21,
    marginBottom: 5,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  locationPin: {
    fontSize: 11,
  },
  locationText: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 12.5,
    color: "rgba(255,255,255,0.5)",
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 14,
  },

  // Amount row
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  amountLabel: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 9.5,
    letterSpacing: 1.4,
    color: "rgba(255,255,255,0.45)",
    marginBottom: 3,
  },
  amountValue: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 20,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
});

export default HotelSummaryCard;
