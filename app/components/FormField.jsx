import { useRef } from "react";
import { Animated, StyleSheet, Text, TextInput, View } from "react-native";

const COLORS = {
  primary: "#0A1D37",
  inputBg: "#FFFFFF",
  inputBorder: "#E0DDD8",
  inputBorderFocus: "#C5A059",
  textMuted: "#9A9690",
  textBody: "#3A3530",
  textLabel: "#5A5550",
  error: "#DC2626",
};

/**
 * FormField
 * Standardized animated labeled text input. Consolidates the pattern
 * used in LoginPage and RegisterPage into a single reusable component.
 * Reusable in CheckoutPage, ProfilePage, RegisterPage, LoginPage.
 *
 * @param {string}    label
 * @param {string}    [placeholder]
 * @param {string}    value
 * @param {Function}  onChangeText
 * @param {boolean}   [secureTextEntry]
 * @param {string}    [keyboardType]
 * @param {string}    [autoCapitalize]   - default "none"
 * @param {string}    [error]            - Inline error message
 * @param {any}       [rightElement]     - Optional JSX rendered on right side of label row
 * @param {object}    [style]            - Outer wrapper style
 * @param {object}    [inputProps]       - Any extra TextInput props
 */
const FormField = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  error,
  rightElement,
  style,
  inputProps = {},
}) => {
  const borderAnim = useRef(new Animated.Value(0)).current;

  const onFocus = () =>
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  const onBlur = () =>
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? COLORS.error : COLORS.inputBorder,
      COLORS.inputBorderFocus,
    ],
  });

  return (
    <View style={[styles.wrapper, style]}>
      {/* Label row */}
      <View style={styles.labelRow}>
        <Text style={[styles.label, error && styles.labelError]}>{label}</Text>
        {rightElement}
      </View>

      {/* Input */}
      <Animated.View style={[styles.inputContainer, { borderColor }]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={onFocus}
          onBlur={onBlur}
          {...inputProps}
        />
      </Animated.View>

      {/* Inline error */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 10.5,
    color: COLORS.textLabel,
    letterSpacing: 1.2,
  },
  labelError: {
    color: COLORS.error,
  },
  inputContainer: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 52,
    justifyContent: "center",
  },
  input: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14.5,
    color: COLORS.textBody,
    paddingVertical: 0,
  },
  errorText: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 12,
    color: COLORS.error,
  },
});

export default FormField;
