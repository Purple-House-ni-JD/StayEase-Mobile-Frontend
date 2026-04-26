import { useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, FONTS } from "../constants/colors";

/**
 * FilterTabBar
 *
 * A horizontally scrollable tab/filter strip.
 * The active tab gets a gold underline; inactive tabs are muted.
 *
 * Props:
 *  - tabs        {Array<{id, label}>}  Tab definitions
 *  - activeId    {string}             Currently selected tab id
 *  - onSelect    {function(id)}       Called when a tab is pressed
 *  - style       {object}            Extra styles on the wrapper
 *
 * Usage:
 *   const TABS = [
 *     { id: "all", label: "ALL" },
 *     { id: "active", label: "ACTIVE" },
 *     { id: "pending", label: "PENDING" },
 *     { id: "cancelled", label: "CANCELLED" },
 *   ];
 *   <FilterTabBar tabs={TABS} activeId={activeTab} onSelect={setActiveTab} />
 */
const FilterTabBar = ({ tabs = [], activeId, onSelect, style }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[tabStyles.row, style]}
      style={tabStyles.scroll}
    >
      {tabs.map((tab) => (
        <TabItem
          key={tab.id}
          label={tab.label}
          isActive={tab.id === activeId}
          onPress={() => onSelect?.(tab.id)}
        />
      ))}
    </ScrollView>
  );
};

const TabItem = ({ label, isActive, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.94,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 70,
        useNativeDriver: true,
      }),
    ]).start(() => onPress?.());
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={tabStyles.tab}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Text style={[tabStyles.label, isActive && tabStyles.labelActive]}>
          {label}
        </Text>
        {/* Active underline */}
        <View
          style={[tabStyles.underline, isActive && tabStyles.underlineActive]}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const tabStyles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 999,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: FONTS.label,
    fontSize: 12,
    letterSpacing: 1,
    color: COLORS.textMuted,
  },
  labelActive: {
    color: COLORS.primary,
  },
  underline: {
    height: 2,
    width: "100%",
    borderRadius: 1,
    backgroundColor: "transparent",
    marginTop: 6,
  },
  underlineActive: {
    backgroundColor: COLORS.secondary,
  },
});

export default FilterTabBar;
