/**
 * PageHeader
 *
 * Shared top bar used by every profile sub-page (and reusable anywhere else).
 * Renders a back chevron on the left, a centred title, and an optional right
 * action slot (e.g. a Save button or an icon).
 *
 * Props:
 *   title        @param {string}      Page title — centred between back button and action
 *   onBack       @param {function}    Called when the back button is pressed
 *   rightAction  @param {ReactNode}   Optional element rendered in the right slot
 *   style        @param {object}      Extra styles on the outer wrapper
 */

import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const COLORS = {
  primary: "#0A1D37",
  background: "#F5F3EF",
  textMuted: "#9A9690",
};

const PageHeader = ({ title, onBack, rightAction, style }) => (
  <View style={[styles.bar, style]}>
    {/* Back */}
    <TouchableOpacity
      onPress={onBack}
      style={styles.sideSlot}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Text style={styles.backIcon}>←</Text>
    </TouchableOpacity>

    {/* Title */}
    <Text style={styles.title} numberOfLines={1}>
      {title}
    </Text>

    {/* Right action — render an invisible placeholder to keep title centred */}
    <View style={styles.sideSlot}>{rightAction ?? null}</View>
  </View>
);

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 12,
    backgroundColor: COLORS.background,
  },
  sideSlot: {
    width: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  backIcon: {
    fontSize: 22,
    color: COLORS.primary,
  },
  title: {
    flex: 1,
    fontFamily: "NotoSerif-Bold",
    fontSize: 17,
    color: COLORS.primary,
    textAlign: "center",
    letterSpacing: 0.2,
  },
});

export default PageHeader;
