import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  neutral: "#FFFFFF",
  textBody: "#3A3530",
  textMuted: "#9A9690",
  inputBorder: "#E0DDD8",
  error: "#DC2626",
};

/**
 * MenuList
 *
 * A white card containing a vertical list of tappable menu rows.
 * Renders dividers between items automatically.
 *
 * Props:
 *  - items   {Array<MenuListItemProps>}  See MenuListItem props below
 *  - style   {object}                   Extra styles on the card wrapper
 *
 * Usage:
 *   <MenuList
 *     items={[
 *       { icon: "✏️", label: "Edit Profile", onPress: () => {} },
 *       { icon: "📅", label: "Booking History", onPress: () => {} },
 *       { icon: "🚪", label: "Log Out", variant: "destructive", onPress: () => {} },
 *     ]}
 *   />
 */
export const MenuList = ({ items = [], style }) => (
  <View style={[listStyles.card, style]}>
    {items.map((item, index) => (
      <View key={item.label}>
        <MenuListItem {...item} />
        {index < items.length - 1 && <View style={listStyles.divider} />}
      </View>
    ))}
  </View>
);

const listStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.neutral,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.inputBorder,
    marginLeft: 56, // indent past icon
  },
});

/**
 * MenuListItem
 *
 * A single tappable row inside a MenuList.
 *
 * Props:
 *  - icon       {string}                    Emoji icon displayed left
 *  - label      {string}                    Row label text
 *  - onPress    {function}                  Tap handler
 *  - variant    {"default"|"destructive"}   "destructive" renders the label in red
 *  - showChevron {boolean}                  Show right arrow  (default true)
 *  - rightElement {ReactNode}               Optional custom element replacing the chevron
 *  - style      {object}                    Extra styles on the row
 */
export const MenuListItem = ({
  icon,
  label,
  onPress,
  variant = "default",
  showChevron = true,
  rightElement,
  style,
}) => {
  const isDestructive = variant === "destructive";

  return (
    <TouchableOpacity
      style={[itemStyles.row, style]}
      onPress={onPress}
      activeOpacity={0.65}
    >
      {/* Icon container */}
      <View
        style={[
          itemStyles.iconWrap,
          isDestructive && itemStyles.iconWrapDestructive,
        ]}
      >
        <Text style={itemStyles.icon}>{icon}</Text>
      </View>

      {/* Label */}
      <Text
        style={[itemStyles.label, isDestructive && itemStyles.labelDestructive]}
      >
        {label}
      </Text>

      {/* Right side */}
      <View style={itemStyles.right}>
        {rightElement ? (
          rightElement
        ) : showChevron ? (
          <Text
            style={[
              itemStyles.chevron,
              isDestructive && itemStyles.chevronDestructive,
            ]}
          >
            ›
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const itemStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 14,
  },

  // Icon
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(10,29,55,0.05)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconWrapDestructive: {
    backgroundColor: "rgba(220,38,38,0.07)",
  },
  icon: {
    fontSize: 17,
  },

  // Label
  label: {
    flex: 1,
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    color: COLORS.textBody,
  },
  labelDestructive: {
    color: COLORS.error,
  },

  // Right
  right: {
    flexShrink: 0,
  },
  chevron: {
    fontSize: 22,
    color: COLORS.textMuted,
    lineHeight: 24,
  },
  chevronDestructive: {
    color: "rgba(220,38,38,0.5)",
  },
});

export default MenuList;
