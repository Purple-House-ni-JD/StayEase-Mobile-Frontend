import { StyleSheet, Text, View } from "react-native";

const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  textMuted: "#9A9690",
};

/**
 * PriceTag
 * Displays a formatted price with an optional "/night" suffix.
 *
 * @param {number}  amount      - Numeric price value
 * @param {string}  [suffix]    - Label after price, default "/night"
 * @param {string}  [size]      - "sm" | "md" | "lg" — controls font sizing
 * @param {string}  [color]     - Override price text color
 * @param {object}  [style]     - Container style override
 */
const PriceTag = ({ amount, suffix = "/night", size = "md", color, style }) => {
  const priceStyle = [
    styles.price,
    size === "sm" && styles.priceSm,
    size === "lg" && styles.priceLg,
    color ? { color } : null,
  ];

  const suffixStyle = [
    styles.suffix,
    size === "sm" && styles.suffixSm,
    size === "lg" && styles.suffixLg,
  ];

  return (
    <View style={[styles.container, style]}>
      <Text style={priceStyle}>${amount}</Text>
      {suffix ? <Text style={suffixStyle}>{suffix}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  price: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 20,
    color: COLORS.secondary,
  },
  priceSm: {
    fontSize: 15,
  },
  priceLg: {
    fontSize: 26,
  },
  suffix: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 12,
    color: COLORS.textMuted,
  },
  suffixSm: {
    fontSize: 10,
  },
  suffixLg: {
    fontSize: 14,
  },
});

export default PriceTag;
