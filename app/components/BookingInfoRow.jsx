/**
 * BookingInfoRow
 *
 * A single label + value row used in detail info sections.
 * Optionally renders a left icon (emoji or component).
 *
 * Props:
 *   label      @param {string}         Left-side label text
 *   value      @param {string}         Right-side value text
 *   icon       @param {string}         Optional emoji icon before the label
 *   valueStyle @param {object}         Extra styles on the value Text
 *   style      @param {object}         Extra styles on the wrapper View
 */

import { StyleSheet, Text, View } from "react-native";

const COLORS = {
  primary: "#0A1D37",
  textMuted: "#9A9690",
  textBody: "#3A3530",
  inputBorder: "#E0DDD8",
};

const BookingInfoRow = ({ label, value, icon, valueStyle, style }) => (
  <View style={[styles.row, style]}>
    <View style={styles.labelGroup}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={styles.label}>{label}</Text>
    </View>
    <Text style={[styles.value, valueStyle]} numberOfLines={2}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  labelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  icon: {
    fontSize: 14,
  },
  label: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 13.5,
    color: COLORS.textMuted,
  },
  value: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 13.5,
    color: COLORS.primary,
    textAlign: "right",
    flexShrink: 1,
    marginLeft: 16,
  },
});

export default BookingInfoRow;
