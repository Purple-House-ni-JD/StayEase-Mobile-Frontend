import { StyleSheet, Text, View } from "react-native";

const COLORS = {
  primary: "#0A1D37",
  neutral: "#FFFFFF",
  inputBorder: "#E0DDD8",
  textMuted: "#9A9690",
  textBody: "#3A3530",
};

const SERVICE_FEE_RATE = 0.1; // 10%

/**
 * PriceBreakdown
 * Itemized pricing card: nightly rate × nights, service fee, total.
 *
 * @param {number}  pricePerNight  - Room rate per night
 * @param {number}  nights         - Number of nights selected
 * @param {number}  [serviceFee]   - Override service fee; defaults to 10% of subtotal
 * @param {object}  [style]        - Container style override
 */
const PriceBreakdown = ({ pricePerNight, nights, serviceFee, style }) => {
  const subtotal = pricePerNight * nights;
  const fee = serviceFee ?? Math.round(subtotal * SERVICE_FEE_RATE);
  const total = subtotal + fee;

  if (!nights || nights <= 0) return null;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.heading}>Price Breakdown</Text>

      {/* Subtotal row */}
      <View style={styles.row}>
        <Text style={styles.label}>
          ₱{pricePerNight} × {nights} {nights === 1 ? "night" : "nights"}
        </Text>
        <Text style={styles.value}>₱{subtotal}</Text>
      </View>

      {/* Service fee row */}
      <View style={styles.row}>
        <Text style={styles.label}>Service fee</Text>
        <Text style={styles.value}>₱{fee}</Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Total */}
      <View style={styles.row}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>₱{total}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.neutral,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    gap: 10,
  },
  heading: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 15,
    color: COLORS.primary,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14,
    color: COLORS.textBody,
  },
  value: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14,
    color: COLORS.textBody,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.inputBorder,
    marginVertical: 2,
  },
  totalLabel: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 15,
    color: COLORS.primary,
  },
  totalValue: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 18,
    color: COLORS.primary,
  },
});

export default PriceBreakdown;
