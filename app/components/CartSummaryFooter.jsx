import { useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  neutral: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.55)",
  disabled: "#4A5568",
};

/**
 * CartSummaryFooter
 * Dark navy sticky footer showing total amount + proceed CTA.
 * Reusable in BookingCartPage and CheckoutPage.
 *
 * @param {number}    total         - Total amount to display
 * @param {string}    [label]       - CTA button label, default "Proceed to Checkout"
 * @param {Function}  onPress       - CTA callback
 * @param {boolean}   [disabled]    - Disables the CTA when cart is empty
 * @param {string}    [taxNote]     - Small note below total, default "Inc. all taxes"
 */
const CartSummaryFooter = ({
  total,
  label = "Proceed to Checkout",
  onPress,
  disabled = false,
  taxNote = "Inc. all taxes",
}) => {
  const btnScale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (disabled) return;
    Animated.sequence([
      Animated.timing(btnScale, {
        toValue: 0.96,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(btnScale, {
        toValue: 1,
        duration: 90,
        useNativeDriver: true,
      }),
    ]).start(() => onPress?.());
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["bottom"]} style={styles.safe}>
        {/* Total row */}
        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
            <Text style={styles.totalValue}>₱{Number(total).toFixed(2)}</Text>
          </View>
          <Text style={styles.taxNote}>{taxNote}</Text>
        </View>

        {/* CTA */}
        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <TouchableOpacity
            style={[styles.ctaBtn, disabled && styles.ctaBtnDisabled]}
            onPress={handlePress}
            activeOpacity={disabled ? 1 : 0.88}
          >
            <Text style={[styles.ctaText, disabled && styles.ctaTextDisabled]}>
              {label} {disabled ? "" : "→"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -6 },
    elevation: 16,
  },
  safe: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 12,
    gap: 16,
  },

  // Total
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  totalLabel: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 10.5,
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  totalValue: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 28,
    color: COLORS.secondary,
    letterSpacing: 0.5,
  },
  taxNote: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 6,
  },

  // CTA
  ctaBtn: {
    backgroundColor: COLORS.secondary,
    borderRadius: 50,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  ctaBtnDisabled: {
    backgroundColor: COLORS.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaText: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 16,
    color: COLORS.neutral,
    letterSpacing: 0.3,
  },
  ctaTextDisabled: {
    color: "rgba(255,255,255,0.4)",
  },
});

export default CartSummaryFooter;
