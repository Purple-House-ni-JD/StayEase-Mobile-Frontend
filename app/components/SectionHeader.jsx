import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, FONTS } from "../constants/colors";

/**
 * SectionHeader
 * A row with a bold section title and an optional right-side action label.
 *
 * @param {string}    title           - Section heading text
 * @param {string}    [actionLabel]   - Right-side link text (e.g. "VIEW ALL")
 * @param {Function}  [onActionPress] - Callback for the right-side action
 * @param {object}    [style]         - Container style override
 */
const SectionHeader = ({ title, actionLabel, onActionPress, style }) => (
  <View style={[styles.row, style]}>
    <Text style={styles.title}>{title}</Text>
    {actionLabel ? (
      <TouchableOpacity onPress={onActionPress} activeOpacity={0.7}>
        <Text style={styles.action}>{actionLabel}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    fontFamily: FONTS.headline,
    fontSize: 18,
    color: COLORS.primary,
  },
  action: {
    fontFamily: FONTS.label,
    fontSize: 11.5,
    color: COLORS.secondary,
    letterSpacing: 1,
  },
});

export default SectionHeader;
