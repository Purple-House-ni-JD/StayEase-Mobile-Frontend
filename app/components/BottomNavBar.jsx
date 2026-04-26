import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, FONTS } from "../constants/colors";

const BottomNavBar = ({ tabs = [], activeId, onSelect, style }) => {
  return (
    <View style={[navStyles.wrapper, style]}>
      {tabs.map((tab) => (
        <NavItem
          key={tab.id}
          icon={tab.icon}
          label={tab.label}
          isActive={tab.id === activeId}
          onPress={() => onSelect?.(tab.id)}
        />
      ))}
    </View>
  );
};

const NavItem = ({ icon, label, isActive, onPress }) => (
  <TouchableOpacity
    style={navStyles.item}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <Text style={[navStyles.icon, isActive && navStyles.iconActive]}>
      {icon}
    </Text>
    <Text style={[navStyles.label, isActive && navStyles.labelActive]}>
      {label}
    </Text>
    <View style={[navStyles.dot, isActive && navStyles.dotActive]} />
  </TouchableOpacity>
);

const navStyles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 12,
    borderTopWidth: 0,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  icon: {
    fontSize: 20,
    color: "rgba(255,255,255,0.55)",
  },
  iconActive: {
    color: COLORS.secondary,
  },
  label: {
    fontFamily: FONTS.label,
    fontSize: 10,
    letterSpacing: 0.8,
    color: "rgba(255,255,255,0.45)",
  },
  labelActive: {
    color: COLORS.secondary,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "transparent",
    marginTop: 2,
  },
  dotActive: {
    backgroundColor: COLORS.secondary,
  },
});

export default BottomNavBar;
