import { StyleSheet, Text, View } from "react-native";

const COLORS = {
  primary: "#0A1D37",
  background: "#F5F3EF",
  inputBorder: "#E0DDD8",
  textBody: "#3A3530",
  textLabel: "#5A5550",
};

/**
 * AmenityChip
 * A pill-shaped chip displaying an icon + label for a room amenity.
 *
 * @param {string}  icon    - Emoji or text icon
 * @param {string}  label   - Amenity name
 * @param {object}  [style] - Container style override
 */
const AmenityChip = ({ icon, label, style }) => (
  <View style={[styles.chip, style]}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={styles.label} numberOfLines={1}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  icon: {
    fontSize: 14,
  },
  label: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 13,
    color: COLORS.textBody,
  },
});

export default AmenityChip;
