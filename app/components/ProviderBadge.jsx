/**
 * ProviderBadge
 *
 * Shows a single OAuth provider (Google / Facebook) as a pill badge.
 * Used in EditProfilePage to display linked social accounts.
 *
 * Props:
 *   provider  {"google" | "facebook"}
 *   style     {object}
 */

import { StyleSheet, Text, View } from "react-native";

const PROVIDER_CONFIG = {
  google: {
    label: "Google",
    icon: "🔵",
    color: "#1A73E8",
    bg: "#E8F0FE",
    border: "#AECBFA",
  },
  facebook: {
    label: "Facebook",
    icon: "🔷",
    color: "#1877F2",
    bg: "#E7F0FF",
    border: "#A8C8FE",
  },
};

const ProviderBadge = ({ provider, style }) => {
  const cfg = PROVIDER_CONFIG[provider] ?? {
    label: provider,
    icon: "🔗",
    color: "#9A9690",
    bg: "#F5F3EF",
    border: "#E0DDD8",
  };

  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: cfg.bg, borderColor: cfg.border },
        style,
      ]}
    >
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  icon: {
    fontSize: 13,
  },
  label: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 12.5,
  },
});

export default ProviderBadge;
