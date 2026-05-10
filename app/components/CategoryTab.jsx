import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { COLORS, FONTS } from "../constants/colors";

const CategoryTab = ({ label, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.75}
    style={[styles.tabWrapper, active && styles.tabWrapperActive]}
  >
    <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  tabWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 999,
    backgroundColor: COLORS.surface,
  },
  tabWrapperActive: {
    backgroundColor: COLORS.secondary,
  },
  tabLabel: {
    fontFamily: FONTS.label,
    fontSize: 12,
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  tabLabelActive: {
    color: COLORS.neutral,
  },
});

export default CategoryTab;
