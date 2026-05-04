import { TouchableOpacity, View, StyleSheet, Text } from "react-native";
import { COLORS } from "../constants/colors";

/**
 * StarRating
 * Interactive 1-5 star selector for reviews. Shows filled stars up to the
 * selected rating, hollow stars for unselected.
 *
 * @param {number}    rating      - Current rating (1-5)
 * @param {Function}  onRate      - Callback when star is pressed
 * @param {string}    [size]      - "sm", "md", "lg" (default: "md")
 * @param {boolean}   [disabled]  - Disable interaction (default: false)
 */
const StarRating = ({ rating = 0, onRate, size = "md", disabled = false }) => {
  const sizeMap = {
    sm: { star: 16, gap: 4 },
    md: { star: 24, gap: 6 },
    lg: { star: 32, gap: 8 },
  };

  const { star, gap } = sizeMap[size];

  return (
    <View style={[styles.container, { gap }]}>
      {[1, 2, 3, 4, 5].map((star_num) => (
        <TouchableOpacity
          key={star_num}
          onPress={() => !disabled && onRate?.(star_num)}
          disabled={disabled}
          activeOpacity={disabled ? 1 : 0.7}
        >
          <Text
            style={[
              styles.star,
              { fontSize: star },
              rating >= star_num ? styles.starFilled : styles.starEmpty,
            ]}
          >
            {rating >= star_num ? "★" : "☆"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  star: {
    lineHeight: 30,
  },
  starFilled: {
    color: COLORS.secondary,
  },
  starEmpty: {
    color: COLORS.textMuted,
  },
});

export default StarRating;
