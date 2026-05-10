/**
 * SectionCard
 *
 * White rounded container with an optional section title.
 * Used throughout BookingDetailPage to visually group related info.
 *
 * Props:
 *   title    {string}      Optional heading above the card
 *   children {ReactNode}
 *   style    {object}      Extra styles on the card wrapper
 */

import { StyleSheet, Text, View } from "react-native";

const COLORS = {
  primary: "#0A1D37",
  neutral: "#FFFFFF",
  inputBorder: "#E0DDD8",
};

const SectionCard = ({ title, children, style }) => (
  <View style={styles.wrapper}>
    {title ? <Text style={styles.title}>{title}</Text> : null}
    <View style={[styles.card, style]}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  title: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: COLORS.neutral,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
});

export default SectionCard;
