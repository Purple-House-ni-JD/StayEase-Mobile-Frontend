/**
 * TopBar
 * Reusable sticky navigation bar for all StayEase pages.
 *
 * Variants:
 *   "default" — hamburger | STAYEASE brand | avatar (main pages)
 *   "back"    — back arrow | page title     | optional right element (sub-pages)
 *
 * Examples:
 *   <TopBar user={user} onMenuPress={openDrawer} />
 *   <TopBar variant="back" title="Edit Profile" onBack={() => router.back()} />
 *   <TopBar variant="back" title="Notifications" rightElement={<BellIcon />} />
 */

import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import HamburgerMenu from "./HamburgerMenu";

// ─── Constants ────────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  neutral: "#FFFFFF",
};

const FONTS = {
  bold: "PlusJakartaSans-Bold",
};

// ─── Private sub-components ───────────────────────────────────────────────────
const AvatarButton = ({ user, onPress }) => {
  const { user: authUser } = useAuth();
  const initial = (
    authUser?.first_name?.[0] ??
    authUser?.username?.[0] ??
    "G"
  ).toUpperCase();

  return (
    <TouchableOpacity
      style={styles.avatarBtn}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {authUser?.avatar_url ? (
        <Image
          source={{ uri: authUser.avatar_url }}
          style={styles.avatarImage}
        />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const IconButton = ({ icon, onPress, fontSize = 20 }) => (
  <TouchableOpacity
    style={styles.iconBtn}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.iconText, { fontSize }]}>{icon}</Text>
  </TouchableOpacity>
);

// ─── TopBar ───────────────────────────────────────────────────────────────────
const TopBar = ({
  variant = "default",
  title = "STAYEASE",
  rightElement,
  style,
  onMenuPress,
  onAvatarPress,
  onBack,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const isBack = variant === "back";
  const resolvedBack = onBack ?? (() => router.back());
  const resolvedAvatar =
    onAvatarPress ?? (() => router.push("pages/ProfilePage"));

  // Determine left / right slot content
  const leftSlot = isBack ? (
    <IconButton
      icon={<Ionicons name="arrow-back" size={24} color="white" />}
      onPress={resolvedBack}
      fontSize={22}
    />
  ) : (
    <IconButton
      icon={<Ionicons name="menu" size={24} color="white" />}
      onPress={() => {
        setMenuVisible(true);
        onMenuPress?.();
      }}
    />
  );

  const rightSlot =
    rightElement ??
    (isBack ? (
      <View style={styles.iconBtn} />
    ) : (
      <AvatarButton
        user={user}
        onPress={() => router.push("pages/ProfilePage")}
      />
    ));

  return (
    <>
      <View style={[styles.wrapper, style]}>
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
          <View style={styles.bar}>
            {leftSlot}
            <Text
              style={[styles.title, isBack && styles.titleBack]}
              numberOfLines={1}
            >
              {title}
            </Text>
            <View style={styles.rightSlot}>{rightSlot}</View>
          </View>
        </SafeAreaView>
      </View>
      <HamburgerMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },

  // Slots
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    color: COLORS.neutral,
    lineHeight: 26,
  },
  rightSlot: {
    width: 36,
    alignItems: "flex-end",
  },

  // Title
  title: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.neutral,
    letterSpacing: 3,
    textAlign: "center",
  },
  titleBack: {
    letterSpacing: 0.5,
    fontSize: 15,
  },

  // Avatar
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
