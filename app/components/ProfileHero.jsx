import { Image, StyleSheet, Text, View } from "react-native";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  neutral: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.55)",
};

// ── Membership tier config ─────────────────────────────────────────────────────
const TIER_CONFIG = {
  gold: {
    label: "GOLD MEMBER",
    icon: "★",
    borderColor: "#C5A059",
    badgeBg: "rgba(197,160,89,0.15)",
    badgeText: "#C5A059",
    badgeBorder: "rgba(197,160,89,0.4)",
  },
  silver: {
    label: "SILVER MEMBER",
    icon: "★",
    borderColor: "#A8A8A8",
    badgeBg: "rgba(168,168,168,0.15)",
    badgeText: "#A8A8A8",
    badgeBorder: "rgba(168,168,168,0.4)",
  },
  platinum: {
    label: "PLATINUM MEMBER",
    icon: "♦",
    borderColor: "#B8D4E8",
    badgeBg: "rgba(184,212,232,0.15)",
    badgeText: "#B8D4E8",
    badgeBorder: "rgba(184,212,232,0.4)",
  },
};

/**
 * ProfileHero
 *
 * Dark banner section displaying the user's avatar, full name, email,
 * and a membership tier badge. Used at the top of profile screens.
 *
 * Props:
 *  - imageSource  {ImageSourcePropType}  Avatar image
 *  - name         {string}               e.g. "Alexander Sterling"
 *  - email        {string}               e.g. "alexander@stayease.com"
 *  - tier         {"gold"|"silver"|"platinum"}  (default "gold")
 *  - style        {object}               Extra styles on the wrapper
 */
const ProfileHero = ({ imageSource, name, email, tier = "gold", style }) => {
  const cfg = TIER_CONFIG[tier] ?? TIER_CONFIG.gold;

  return (
    <View style={[styles.container, style]}>
      {/* ── Avatar ── */}
      <View style={[styles.avatarRing, { borderColor: cfg.borderColor }]}>
        {imageSource ? (
          <Image source={imageSource} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>
              {name ? name.charAt(0).toUpperCase() : "?"}
            </Text>
          </View>
        )}
      </View>

      {/* ── Name ── */}
      <Text style={styles.name}>{name?.toUpperCase()}</Text>

      {/* ── Email ── */}
      <Text style={styles.email}>{email}</Text>

      {/* ── Membership Badge ── */}
      <MembershipBadge
        icon={cfg.icon}
        label={cfg.label}
        bg={cfg.badgeBg}
        textColor={cfg.badgeText}
        borderColor={cfg.badgeBorder}
      />
    </View>
  );
};

// ── Membership pill badge ───────────────────────────────────────────────────
const MembershipBadge = ({ icon, label, bg, textColor, borderColor }) => (
  <View style={[badgeStyles.pill, { backgroundColor: bg, borderColor }]}>
    <Text style={[badgeStyles.icon, { color: textColor }]}>{icon}</Text>
    <Text style={[badgeStyles.label, { color: textColor }]}>{label}</Text>
  </View>
);

const badgeStyles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
    marginTop: 16,
  },
  icon: {
    fontSize: 12,
  },
  label: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 11,
    letterSpacing: 1.4,
  },
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 36,
    paddingHorizontal: 24,
  },

  // Avatar
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2.5,
    padding: 3,
    marginBottom: 18,
    // subtle glow-ring effect via shadow
    shadowColor: "#C5A059",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 44,
  },
  avatarFallback: {
    flex: 1,
    borderRadius: 44,
    backgroundColor: "rgba(197,160,89,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 32,
    color: COLORS.secondary,
  },

  // Text
  name: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 20,
    color: COLORS.neutral,
    letterSpacing: 2.5,
    textAlign: "center",
    marginBottom: 6,
  },
  email: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
  },
});

export default ProfileHero;
