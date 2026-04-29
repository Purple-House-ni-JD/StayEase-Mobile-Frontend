/**
 * ProfilePage
 * Route: pages/ProfilePage
 *
 * Displays user avatar, name, email, membership badge, and a settings menu.
 * Uses TopBar (default variant) as the sticky header.
 */

import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { NAV_TABS, navigateToTab } from "../constants/navigation";
import BottomNavBar from "../components/BottomNavBar";
import TopBar from "../components/TopBar";

// ─── Constants ────────────────────────────────────────────────────────────────
const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  neutral: "#FFFFFF",
  background: "#F5F3EF",
  textMuted: "#9A9690",
  textBody: "#3A3530",
  danger: "#C0392B",
  dangerBg: "#FDF0EE",
};

const FONTS = {
  headline: "NotoSerif-Bold",
  body: "PlusJakartaSans-Regular",
  light: "PlusJakartaSans-Light",
  bold: "PlusJakartaSans-Bold",
};

const MENU_ITEMS = [
  {
    id: "edit",
    icon: "✏️",
    label: "Edit Profile",
    danger: false,
    route: "pages/EditProfilePage",
  },
  {
    id: "history",
    icon: "📅",
    label: "Booking History",
    danger: false,
    route: "pages/BookingsPage",
  },
  // {
  //   id: "payment",
  //   icon: "💳",
  //   label: "Payment Methods",
  //   danger: false,
  //   route: "pages/BookingCartPage",
  // },
  // {
  //   id: "notifs",
  //   icon: "🔔",
  //   label: "Notifications",
  //   danger: false,
  //   route: null,
  // },
  {
    id: "support",
    icon: "🎧",
    label: "Help & Support",
    danger: false,
    route: "pages/HelpSupportPage",
  },
  { id: "logout", icon: "🚪", label: "Log Out", danger: true, route: null },
];

// ─── MenuRow ──────────────────────────────────────────────────────────────────
const MenuRow = ({ icon, label, danger, onPress, isLast }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
    }).start();
  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();

  return (
    <>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <Animated.View style={[styles.menuRow, { transform: [{ scale }] }]}>
          <View
            style={[styles.menuIconWrap, danger && styles.menuIconWrapDanger]}
          >
            <Text style={styles.menuEmoji}>{icon}</Text>
          </View>
          <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>
            {label}
          </Text>
          <Text
            style={[styles.menuChevron, danger && styles.menuChevronDanger]}
          >
            ›
          </Text>
        </Animated.View>
      </TouchableOpacity>
      {!isLast && <View style={styles.menuDivider} />}
    </>
  );
};

// ─── ProfilePage ──────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // Entrance animations
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(-16)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(32)).current;
  const badgeScale = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(heroFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(heroSlide, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(cardFade, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.timing(cardSlide, {
          toValue: 0,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.spring(badgeScale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const displayName = (
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() ||
    user?.username ||
    "Guest User"
  ).toUpperCase();

  const handleMenuPress = async (item) => {
    if (item.id === "logout") {
      await logout();
      router.replace("pages/LoginPage");
    } else if (item.route) {
      router.push(item.route);
    }
  };

  const handleTabSelect = (id) => {
    setActiveTab(id);
    navigateToTab(router, id);
  };

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Sticky header */}
        <TopBar
          onMenuPress={() => {
          }}
        />

        {/* Hero */}
        <View style={styles.hero}>
          {/* Decorative rings */}
          <View style={[styles.ring, styles.ringOuter]} />
          <View style={[styles.ring, styles.ringInner]} />

          <Animated.View
            style={[
              styles.heroBody,
              { opacity: heroFade, transform: [{ translateY: heroSlide }] },
            ]}
          >
            {/* Avatar */}
            <View style={styles.avatarRing}>
              {user?.avatar_url ? (
                <Image
                  source={{ uri: user.avatar_url }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {(
                      user?.first_name?.[0] ??
                      user?.username?.[0] ??
                      "G"
                    ).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.heroName}>{displayName}</Text>
            <Text style={styles.heroEmail}>
              {user?.email ?? "No email linked"}
            </Text>

            {/* Badge */}
            {/* <Animated.View
              style={[styles.badge, { transform: [{ scale: badgeScale }] }]}
            >
              <Text style={styles.badgeStar}>★</Text>
              <Text style={styles.badgeText}>GOLD MEMBER</Text>
            </Animated.View> */}
          </Animated.View>
        </View>

        {/* Menu card */}
        <Animated.View
          style={[
            styles.card,
            { opacity: cardFade, transform: [{ translateY: cardSlide }] },
          ]}
        >
          {MENU_ITEMS.map((item, i) => (
            <MenuRow
              key={item.id}
              icon={item.icon}
              label={item.label}
              danger={item.danger}
              isLast={i === MENU_ITEMS.length - 1}
              onPress={() => handleMenuPress(item)}
            />
          ))}
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>STAYEASE LUXURY CONCIERGE</Text>
          <Text style={styles.footerVersion}>
            Version 2.4.1 (Premium Edition)
          </Text>
        </View>
      </ScrollView>

      <BottomNavBar
        tabs={NAV_TABS}
        activeId={activeTab}
        onSelect={handleTabSelect}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Hero
  hero: {
    backgroundColor: COLORS.primary,
    paddingBottom: 64,
    alignItems: "center",
    overflow: "hidden",
  },
  ring: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(197,160,89,0.10)",
    alignSelf: "center",
  },
  ringOuter: {
    width: width * 1.4,
    height: width * 1.4,
    borderRadius: width * 0.7,
    top: -width * 0.5,
  },
  ringInner: {
    width: width,
    height: width,
    borderRadius: width * 0.5,
    top: -width * 0.3,
  },
  heroBody: {
    alignItems: "center",
    paddingTop: 32,
    gap: 6,
  },

  // Avatar
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: COLORS.secondary,
    padding: 3,
    marginBottom: 14,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 44,
  },
  avatarPlaceholder: {
    flex: 1,
    borderRadius: 44,
    backgroundColor: "rgba(197,160,89,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontFamily: FONTS.headline,
    fontSize: 36,
    color: COLORS.secondary,
  },

  // Name / Email
  heroName: {
    fontFamily: FONTS.headline,
    fontSize: 20,
    color: COLORS.neutral,
    letterSpacing: 2,
    textAlign: "center",
  },
  heroEmail: {
    fontFamily: FONTS.light,
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
  },

  // Badge
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: "rgba(10,29,55,0.8)",
  },
  badgeStar: {
    color: COLORS.secondary,
    fontSize: 11,
  },
  badgeText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.secondary,
    letterSpacing: 2,
  },

  // Menu card
  card: {
    marginHorizontal: 18,
    marginTop: -32,
    backgroundColor: COLORS.neutral,
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(10,29,55,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  menuIconWrapDanger: {
    backgroundColor: COLORS.dangerBg,
  },
  menuEmoji: { fontSize: 17 },
  menuLabel: {
    flex: 1,
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.textBody,
  },
  menuLabelDanger: {
    fontFamily: FONTS.bold,
    color: COLORS.danger,
  },
  menuChevron: {
    fontSize: 20,
    color: COLORS.textMuted,
    lineHeight: 24,
  },
  menuChevronDanger: {
    color: COLORS.danger,
    opacity: 0.5,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginHorizontal: 16,
  },

  // Footer
  footer: {
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 8,
    gap: 4,
  },
  footerBrand: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 2,
  },
  footerVersion: {
    fontFamily: FONTS.light,
    fontSize: 11,
    color: COLORS.secondary,
    letterSpacing: 0.5,
  },
});

export default ProfilePage;
