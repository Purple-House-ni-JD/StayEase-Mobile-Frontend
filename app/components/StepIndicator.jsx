import { StyleSheet, Text, View } from "react-native";

const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  neutral: "#FFFFFF",
  inputBorder: "#E0DDD8",
  textMuted: "#9A9690",
};

/**
 * StepIndicator
 * A horizontal step-progress bar for multi-step flows.
 * Completed steps show a checkmark; active step is gold; future steps are grey.
 *
 * @param {Array<string>} steps       - Step labels e.g. ["CART", "PAYMENT", "CONFIRM"]
 * @param {number}        activeStep  - 0-indexed current step
 * @param {object}        [style]     - Container style override
 */
const StepIndicator = ({ steps, activeStep, style }) => (
  <View style={[styles.container, style]}>
    {steps.map((label, index) => {
      const isDone = index < activeStep;
      const isActive = index === activeStep;

      return (
        <View key={label} style={styles.stepWrapper}>
          {/* Connector line before (skip first) */}
          {index > 0 && (
            <View
              style={[styles.line, (isDone || isActive) && styles.lineActive]}
            />
          )}

          <View style={styles.stepCol}>
            {/* Circle */}
            <View
              style={[
                styles.circle,
                isDone && styles.circleDone,
                isActive && styles.circleActive,
              ]}
            >
              {isDone ? (
                <Text style={styles.checkmark}>✓</Text>
              ) : (
                <Text
                  style={[styles.stepNum, isActive && styles.stepNumActive]}
                >
                  {index + 1}
                </Text>
              )}
            </View>

            {/* Label */}
            <Text
              style={[
                styles.stepLabel,
                isActive && styles.stepLabelActive,
                isDone && styles.stepLabelDone,
              ]}
            >
              {label}
            </Text>
          </View>
        </View>
      );
    })}
  </View>
);

const CIRCLE_SIZE = 36;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  stepWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  // Connector line
  line: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.inputBorder,
    marginBottom: 18, // align with circle centre
  },
  lineActive: {
    backgroundColor: COLORS.secondary,
  },

  // Step column (circle + label)
  stepCol: {
    alignItems: "center",
    gap: 6,
  },

  // Circle
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: COLORS.inputBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  circleDone: {
    backgroundColor: COLORS.inputBorder,
  },
  circleActive: {
    backgroundColor: COLORS.secondary,
  },
  checkmark: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 15,
    color: COLORS.primary,
    lineHeight: 18,
  },
  stepNum: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 14,
    color: COLORS.textMuted,
  },
  stepNumActive: {
    color: COLORS.neutral,
  },

  // Label
  stepLabel: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  stepLabelActive: {
    color: COLORS.secondary,
  },
  stepLabelDone: {
    color: COLORS.textMuted,
  },
});

export default StepIndicator;
