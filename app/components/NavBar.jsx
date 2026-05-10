import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS } from "../constants/colors";

const NavBar = ({ brand = "StayEase", onMenuPress, onNotificationPress }) => {
  return (
    <View style={styles.navbar}>
      <SafeAreaView edges={["top"]} style={styles.navSafe}>
        <View style={styles.navInner}>
          <TouchableOpacity
            style={styles.navHamburger}
            onPress={onMenuPress}
            activeOpacity={0.7}
          >
            <View style={styles.hamLine} />
            <View style={[styles.hamLine, { width: 18 }]} />
            <View style={styles.hamLine} />
          </TouchableOpacity>

          <Text style={styles.navBrand}>{brand}</Text>

          <View style={styles.navRight}>
            <TouchableOpacity
              style={styles.navIconBtn}
              onPress={onNotificationPress}
              activeOpacity={0.7}
            >
              <Text style={styles.navIcon}>🔔</Text>
            </TouchableOpacity>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>J</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    backgroundColor: COLORS.primary,
    zIndex: 10,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  navSafe: {
    backgroundColor: COLORS.primary,
  },
  navInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  navHamburger: {
    gap: 5,
    padding: 4,
  },
  hamLine: {
    width: 22,
    height: 2,
    backgroundColor: COLORS.neutral,
    borderRadius: 2,
  },
  navBrand: {
    fontFamily: FONTS.headline,
    fontSize: 20,
    color: COLORS.secondary,
    letterSpacing: 0.5,
  },
  navRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  navIconBtn: {
    padding: 4,
  },
  navIcon: {
    fontSize: 20,
    color: COLORS.neutral,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontFamily: FONTS.label,
    fontSize: 15,
    color: COLORS.primary,
  },
});

export default NavBar;
