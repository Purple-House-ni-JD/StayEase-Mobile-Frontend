import { useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

// ─── Design Tokens (import from your shared tokens file) ──────────────────────
const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  neutral: "#FFFFFF",
  background: "#F5F3EF",
  textMuted: "#9A9690",
};

/**
 * ConfirmationHeader
 *
 * Displays a circular status icon with a title and subtitle.
 * Used on success / error / info result screens.
 *
 * Props:
 *  - icon        {string}  Emoji or character inside the circle  (default "✓")
 *  - eyebrow     {string}  Small uppercase label above the title  (default "TRANSACTION SUCCESSFUL")
 *  - title       {string}  Large heading                          (required)
 *  - subtitle    {string}  Body copy below the heading            (optional)
 *  - iconBg      {string}  Background color of the circle         (default secondary gold)
 *  - iconColor   {string}  Icon / text color inside the circle    (default white)
 *  - style       {object}  Extra styles applied to the wrapper
 */
const ConfirmationHeader = ({
  icon = "✓",
  eyebrow = "TRANSACTION SUCCESSFUL",
  title,
  subtitle,
  iconBg = COLORS.secondary,
  iconColor = COLORS.neutral,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useRef(
    (() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start();
    })(),
  );

  return (
    <View style={[styles.container, style]}>
      {/* Success Icon Circle */}
      <Animated.View
        style={[styles.iconRing, { transform: [{ scale: scaleAnim }] }]}
      >
        <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
          <Text style={[styles.iconText, { color: iconColor }]}>{icon}</Text>
        </View>
      </Animated.View>

      {/* Text Block */}
      <Animated.View style={{ opacity: fadeAnim, alignItems: "center" }}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },

  // Icon
  iconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: "rgba(197,160,89,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 32,
    lineHeight: 36,
  },

  // Text
  eyebrow: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 10,
    letterSpacing: 2.5,
    color: COLORS.secondary,
    marginBottom: 8,
  },
  title: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 30,
    color: COLORS.neutral,
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 260,
  },
});

export default ConfirmationHeader;
