import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  neutral: "#FFFFFF",
};

const FONTS = {
  bold: "PlusJakartaSans-Bold",
};

// ─── TopBar Component ─────────────────────────────────────────────────────────
/**
 * Reusable sticky top bar for StayEase pages.
 *
 * Props:
 * @param {function}      onMenuPress       - Called when the ☰ hamburger is pressed
 * @param {string}        [title]           - Center title (default: "STAYEASE")
 * @param {object}        [user]            - User object with optional `avatar`, `first_name`, `username`
 * @param {function}      [onAvatarPress]   - Called when the avatar/initial button is pressed
 * @param {ReactNode}     [rightElement]    - Optional custom element to replace the avatar button
 * @param {object}        [style]           - Extra style override for the outer wrapper
 */
const TopBar = ({
  onMenuPress,
  title = "STAYEASE",
  user,
  onAvatarPress,
  rightElement,
  style,
}) => {
  const initial = (
    user?.first_name?.[0] ||
    user?.username?.[0] ||
    "G"
  ).toUpperCase();

  return (
    <View style={[styles.wrapper, style]}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.bar}>
          {/* Left — Hamburger */}
          <TouchableOpacity
            style={styles.sideBtn}
            onPress={onMenuPress}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>

          {/* Center — Brand / Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Right — Avatar or custom element */}
          <View style={styles.sideBtn}>
            {rightElement ?? (
              <TouchableOpacity
                style={styles.avatarBtn}
                onPress={onAvatarPress}
                activeOpacity={0.8}
              >
                {user?.avatar ? (
                  // Replace with your actual image source as needed
                  <Image
                    source={{ uri: user.avatar }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>{initial}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.primary,
    zIndex: 10,
  },
  safeArea: {
    backgroundColor: COLORS.primary,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
  },

  // ── Left / Right slots ──
  sideBtn: {
    width: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  menuIcon: {
    fontSize: 20,
    color: COLORS.neutral,
  },

  // ── Title ──
  title: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.neutral,
    letterSpacing: 3,
  },

  // ── Avatar ──
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.primary,
  },
});

export default TopBar;
