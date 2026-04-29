/**
 * BookingStatusBadge
 *
 * Pill badge for all four booking statuses from the backend:
 * pending | confirmed | completed | cancelled
 *
 * Also accepts the three display aliases used by BookingCard:
 * active → maps to confirmed style
 *
 * Props:
 *   status  @param {string}  Backend status string
 *   style   @param {object}  Extra styles on the wrapper
 */

import { StyleSheet, Text, View } from "react-native";

const STATUS_CONFIG = {
  pending: {
    label: "PENDING",
    backgroundColor: "#FFF4E0",
    textColor: "#B07800",
    borderColor: "#F5C842",
  },
  confirmed: {
    label: "CONFIRMED",
    backgroundColor: "#E8F5E9",
    textColor: "#2E7D32",
    borderColor: "#81C784",
  },
  // "active" is the alias BookingCard uses — treat same as confirmed
  active: {
    label: "CONFIRMED",
    backgroundColor: "#E8F5E9",
    textColor: "#2E7D32",
    borderColor: "#81C784",
  },
  completed: {
    label: "COMPLETED",
    backgroundColor: "#E3F0FB",
    textColor: "#1565C0",
    borderColor: "#90CAF9",
  },
  cancelled: {
    label: "CANCELLED",
    backgroundColor: "#F5F5F5",
    textColor: "#9A9690",
    borderColor: "#E0DDD8",
  },
};

const BookingStatusBadge = ({ status, style }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: cfg.backgroundColor,
          borderColor: cfg.borderColor,
        },
        style,
      ]}
    >
      <Text style={[styles.label, { color: cfg.textColor }]}>{cfg.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  label: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 10,
    letterSpacing: 1,
  },
});

export default BookingStatusBadge;
