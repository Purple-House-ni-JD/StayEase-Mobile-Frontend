import { StyleSheet, Text, View } from "react-native";

const COLORS = {
  secondary: "#C5A059",
  textMuted: "#9A9690",
  textBody: "#3A3530",
};

/**
 * RatingBadge
 * Star icon + numeric rating + optional review count.
 *
 * @param {number}  rating        - e.g. 4.9
 * @param {number}  [reviewCount] - e.g. 124 — hidden if omitted
 * @param {string}  [size]        - "sm" | "md"
 * @param {object}  [style]       - Container style override
 */
const RatingBadge = ({ rating, reviewCount, size = "md", style }) => {
  const isSmall = size === "sm";

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.star, isSmall && styles.starSm]}>★</Text>
      <Text style={[styles.rating, isSmall && styles.ratingSm]}>
        {Number(rating).toFixed(1)}
      </Text>
      {reviewCount != null && (
        <Text style={[styles.count, isSmall && styles.countSm]}>
          ({reviewCount} reviews)
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  star: {
    fontSize: 15,
    color: COLORS.secondary,
  },
  starSm: {
    fontSize: 12,
  },
  rating: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 15,
    color: COLORS.textBody,
  },
  ratingSm: {
    fontSize: 12,
  },
  count: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 13,
    color: COLORS.textMuted,
  },
  countSm: {
    fontSize: 11,
  },
});

export default RatingBadge;
