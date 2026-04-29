/**
 * PaymentMethodBadge
 *
 * Displays a payment method pill with an icon and label.
 * Handles all four backend payment methods:
 * gcash | maya | card | cash
 *
 * Props:
 *   method  @param {string}  Backend payment_method string
 *   style   @param {object}  Extra wrapper styles
 */

import { StyleSheet, Text, View } from "react-native";

const METHOD_CONFIG = {
  gcash: { label: "GCash", icon: "💙", color: "#0072C6" },
  maya: { label: "Maya", icon: "💚", color: "#007B5E" },
  card: { label: "Credit / Debit Card", icon: "💳", color: "#0A1D37" },
  cash: { label: "Cash on Arrival", icon: "💵", color: "#5D4E37" },
};

const COLORS = {
  background: "#F5F3EF",
  inputBorder: "#E0DDD8",
};

const PaymentMethodBadge = ({ method, style }) => {
  const cfg = METHOD_CONFIG[method] ?? {
    label: method ?? "Unknown",
    icon: "💳",
    color: "#9A9690",
  };

  return (
    <View style={[styles.pill, style]}>
      <Text style={styles.icon}>{cfg.icon}</Text>
      <Text style={[styles.label, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-end",
  },
  icon: {
    fontSize: 14,
  },
  label: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 12.5,
  },
});

export default PaymentMethodBadge;
