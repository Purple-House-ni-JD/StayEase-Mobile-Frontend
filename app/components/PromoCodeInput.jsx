import { useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  neutral: "#FFFFFF",
  inputBg: "#FFFFFF",
  inputBorder: "#E0DDD8",
  inputBorderFocus: "#C5A059",
  textMuted: "#9A9690",
  textBody: "#3A3530",
  successBg: "rgba(34,197,94,0.1)",
  successText: "#16A34A",
  errorBg: "rgba(239,68,68,0.1)",
  errorText: "#DC2626",
};

// Mock valid promo codes — replace with API call
const VALID_CODES = {
  STAYEASE10: 0.1,
  LUXURY20: 0.2,
  WELCOME15: 0.15,
};

/**
 * PromoCodeInput
 * A promo code text field + Apply button with success/error feedback.
 *
 * @param {Function} onApply  - Called with { code, discountRate } on valid apply
 * @param {Function} onRemove - Called when a valid code is cleared
 * @param {object}  [style]   - Container style override
 */
const PromoCodeInput = ({ onApply, onRemove, style }) => {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState(null); // null | "success" | "error"
  const [applied, setApplied] = useState(null); // applied code string
  const [loading, setLoading] = useState(false);

  const borderAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const focusBorder = () =>
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  const blurBorder = () =>
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 6,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -6,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 4,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.inputBorder, COLORS.inputBorderFocus],
  });

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    // Simulate async API check
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);

    const rate = VALID_CODES[trimmed];
    if (rate) {
      setStatus("success");
      setApplied(trimmed);
      onApply?.({ code: trimmed, discountRate: rate });
    } else {
      setStatus("error");
      setApplied(null);
      shake();
    }
  };

  const handleClear = () => {
    setCode("");
    setStatus(null);
    setApplied(null);
    onRemove?.();
  };

  const isApplied = status === "success";

  return (
    <View style={[styles.wrapper, style]}>
      <Text style={styles.label}>PROMO CODE</Text>

      <Animated.View
        style={[styles.row, { transform: [{ translateX: shakeAnim }] }]}
      >
        <Animated.View style={[styles.inputContainer, { borderColor }]}>
          <TextInput
            style={styles.input}
            placeholder="Enter code"
            placeholderTextColor={COLORS.textMuted}
            value={code}
            onChangeText={(t) => {
              setCode(t);
              if (status) setStatus(null);
            }}
            autoCapitalize="characters"
            onFocus={focusBorder}
            onBlur={blurBorder}
            editable={!isApplied}
          />
        </Animated.View>

        <TouchableOpacity
          style={[styles.applyBtn, isApplied && styles.clearBtn]}
          onPress={isApplied ? handleClear : handleApply}
          activeOpacity={0.85}
          disabled={loading}
        >
          <Text style={styles.applyBtnText}>
            {loading ? "..." : isApplied ? "Clear" : "Apply"}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Feedback */}
      {status === "success" && (
        <View style={[styles.feedback, { backgroundColor: COLORS.successBg }]}>
          <Text style={[styles.feedbackText, { color: COLORS.successText }]}>
            ✓ Code applied — {Math.round(VALID_CODES[applied] * 100)}% off!
          </Text>
        </View>
      )}
      {status === "error" && (
        <View style={[styles.feedback, { backgroundColor: COLORS.errorBg }]}>
          <Text style={[styles.feedbackText, { color: COLORS.errorText }]}>
            ✗ Invalid or expired promo code.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 10.5,
    color: "#5A5550",
    letterSpacing: 1.2,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  inputContainer: {
    flex: 1,
    height: 50,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  input: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14.5,
    color: COLORS.textBody,
    paddingVertical: 0,
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    minWidth: 72,
  },
  clearBtn: {
    backgroundColor: COLORS.inputBorder,
  },
  applyBtnText: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 14,
    color: COLORS.neutral,
  },
  feedback: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  feedbackText: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 13,
  },
});

export default PromoCodeInput;
