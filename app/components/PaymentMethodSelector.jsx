import { useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  neutral: "#FFFFFF",
  inputBorder: "#E0DDD8",
  selectedBorder: "#0A1D37",
  selectedBg: "rgba(10,29,55,0.03)",
  textMuted: "#9A9690",
  textBody: "#3A3530",
  radioInner: "#C5A059",
};

/**
 * PaymentMethodSelector
 * Radio-button style list of payment method options.
 * Reusable in CheckoutPage and Profile payment settings.
 *
 * @param {Array}   methods          - Array of { id, icon, label, sublabel }
 * @param {string}  selectedId       - Currently selected method id
 * @param {Function} onSelect        - Called with method id on selection
 * @param {object}  [style]
 */
const PaymentMethodSelector = ({ methods, selectedId, onSelect, style }) => (
  <View style={[styles.container, style]}>
    {methods.map((method, index) => {
      const isSelected = method.id === selectedId;
      return (
        <MethodOption
          key={method.id}
          method={method}
          isSelected={isSelected}
          onPress={() => onSelect(method.id)}
          isLast={index === methods.length - 1}
        />
      );
    })}
  </View>
);

const MethodOption = ({ method, isSelected, onPress, isLast }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start(() => onPress());
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.option,
          isSelected && styles.optionSelected,
          !isLast && styles.optionGap,
        ]}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        {/* Icon container */}
        <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
          <Text style={styles.icon}>{method.icon}</Text>
        </View>

        {/* Labels */}
        <View style={styles.labels}>
          <Text style={[styles.label, isSelected && styles.labelSelected]}>
            {method.label}
          </Text>
          <Text style={styles.sublabel}>{method.sublabel}</Text>
        </View>

        {/* Radio */}
        <View style={[styles.radio, isSelected && styles.radioSelected]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },

  // Option card
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: COLORS.neutral,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  optionSelected: {
    borderColor: COLORS.selectedBorder,
    backgroundColor: COLORS.selectedBg,
  },
  optionGap: {
    marginBottom: 12,
  },

  // Icon
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.inputBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxSelected: {
    backgroundColor: "rgba(10,29,55,0.08)",
  },
  icon: {
    fontSize: 20,
  },

  // Labels
  labels: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 14,
    color: COLORS.textBody,
  },
  labelSelected: {
    color: COLORS.primary,
  },
  sublabel: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 12,
    color: COLORS.textMuted,
  },

  // Radio button
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: COLORS.secondary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.radioInner,
  },
});

export default PaymentMethodSelector;
