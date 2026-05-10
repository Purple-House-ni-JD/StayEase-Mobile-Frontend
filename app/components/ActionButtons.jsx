import { useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  neutral: "#FFFFFF",
};

// ─── Shared press animation hook ──────────────────────────────────────────────
const usePressScale = (onPress) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start(() => onPress?.());
  };

  return { scaleAnim, handlePress };
};

/**
 * GoldButton
 *
 * Filled button with the secondary gold background. Primary CTA.
 *
 * Props:
 *  - label     {string}    Button text
 *  - onPress   {function}  Handler
 *  - icon      {string}    Optional leading emoji/icon
 *  - disabled  {boolean}
 *  - style     {object}    Wrapper override
 */
export const GoldButton = ({ label, onPress, icon, disabled, style }) => {
  const { scaleAnim, handlePress } = usePressScale(onPress);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        style={[goldStyles.btn, disabled && goldStyles.disabled]}
        onPress={handlePress}
        activeOpacity={0.88}
        disabled={disabled}
      >
        {icon ? <Text style={goldStyles.icon}>{icon}</Text> : null}
        <Text style={goldStyles.text}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const goldStyles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.secondary,
    borderRadius: 50,
    paddingVertical: 17,
    paddingHorizontal: 28,
    gap: 8,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 16,
  },
  text: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 15.5,
    color: COLORS.primary,
    letterSpacing: 0.2,
  },
});

/**
 * GhostButton
 *
 * Outlined / ghost button — secondary action on dark backgrounds.
 *
 * Props:
 *  - label     {string}    Button text
 *  - onPress   {function}  Handler
 *  - icon      {string}    Optional leading emoji/icon
 *  - disabled  {boolean}
 *  - style     {object}    Wrapper override
 */
export const GhostButton = ({ label, onPress, icon, disabled, style }) => {
  const { scaleAnim, handlePress } = usePressScale(onPress);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        style={[ghostStyles.btn, disabled && ghostStyles.disabled]}
        onPress={handlePress}
        activeOpacity={0.75}
        disabled={disabled}
      >
        {icon ? <Text style={ghostStyles.icon}>{icon}</Text> : null}
        <Text style={ghostStyles.text}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ghostStyles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 28,
    gap: 8,
  },
  disabled: {
    opacity: 0.4,
  },
  icon: {
    fontSize: 15,
  },
  text: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 15.5,
    color: COLORS.secondary,
    letterSpacing: 0.2,
  },
});
