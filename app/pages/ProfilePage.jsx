import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Animated,
  Dimensions,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import { COLORS } from "../constants/colors";
import { NAV_TABS, navigateToTab } from "../constants/navigation";
import { useAuth } from "@/context/AuthContext";
import BottomNavBar from "../components/BottomNavBar";
import TopBar from "../components/TopBar";

const { width } = Dimensions.get("window");

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  neutral: "#FFFFFF",
  background: "#F5F3EF",
  textMuted: "#9A9690",
  textBody: "#3A3530",
  danger: "#C0392B",
  dangerLight: "#FDF0EE",
};

const F = {
  headline: "NotoSerif-Bold",
  headlineReg: "NotoSerif-Regular",
  body: "PlusJakartaSans-Regular",
  light: "PlusJakartaSans-Light",
  bold: "PlusJakartaSans-Bold",
};

// ─── Menu Items ───────────────────────────────────────────────────────────────
const MENU_ITEMS = [
  { id: "edit", icon: "✏️", label: "Edit Profile", danger: false },
  { id: "history", icon: "📅", label: "Booking History", danger: false },
  { id: "payment", icon: "💳", label: "Payment Methods", danger: false },
  { id: "notifs", icon: "🔔", label: "Notifications", danger: false },
  { id: "support", icon: "🎧", label: "Help & Support", danger: false },
  { id: "logout", icon: "🚪", label: "Log Out", danger: true },
];

// ─── Menu Row ─────────────────────────────────────────────────────────────────
const MenuRow = ({ icon, label, danger, onPress, isLast }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
    }).start();
  const handlePressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();

  return (
    <>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Animated.View
          style={[styles.menuRow, { transform: [{ scale: scaleAnim }] }]}
        >
          <View
            style={[styles.menuIconWrap, danger && styles.menuIconWrapDanger]}
          >
            <Text style={styles.menuIconEmoji}>{icon}</Text>
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

// ─── Main Component ───────────────────────────────────────────────────────────
const ProfilePage = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(-16)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(32)).current;
  const badgePop = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(heroFade, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.timing(heroSlide, {
          toValue: 0,
          duration: 550,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(cardFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(cardSlide, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(badgePop, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleTabSelect = (id) => {
    setActiveTab(id);
    navigateToTab(router, id);
  };

  const handleMenuPress = async (id) => {
    if (id === "logout") {
      await logout();
      router.replace("pages/LoginPage");
    } else if (id === "history") {
      router.push("pages/BookingsPage");
    } else if (id === "payment") {
      router.push("pages/BookingCartPage");
    }
  };

  const displayName =
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    user?.username ||
    "Guest User";

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        {/* ── Sticky Top Bar ── */}
        <TopBar
          user={user}
          onMenuPress={() => {
            /* TODO: open drawer */
          }}
          onAvatarPress={() => {
            /* TODO: open avatar menu */
          }}
        />

        {/* ── Hero Header ── */}
        <View style={styles.hero}>
          <View style={styles.ringOuter} />
          <View style={styles.ringInner} />

          <Animated.View
            style={[
              styles.heroContent,
              { opacity: heroFade, transform: [{ translateY: heroSlide }] },
            ]}
          >
            {/* Avatar */}
            <View style={styles.avatarRing}>
              {/*
                Replace View below with:
                <Image source={{ uri: user?.avatar }} style={styles.avatarImage} />
              */}
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {(
                    user?.first_name?.[0] ||
                    user?.username?.[0] ||
                    "G"
                  ).toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={styles.heroName}>{displayName.toUpperCase()}</Text>
            <Text style={styles.heroEmail}>
              {user?.email || "No email linked"}
            </Text>

            <Animated.View
              style={[styles.memberBadge, { transform: [{ scale: badgePop }] }]}
            >
              <Text style={styles.memberBadgeStar}>★</Text>
              <Text style={styles.memberBadgeText}>GOLD MEMBER</Text>
            </Animated.View>
          </Animated.View>
        </View>

        {/* ── Menu Card ── */}
        <Animated.View
          style={[
            styles.menuCard,
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
              onPress={() => handleMenuPress(item.id)}
            />
          ))}
        </Animated.View>

        {/* ── Footer ── */}
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
    backgroundColor: C.background,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  // ── Hero ──
  hero: {
    backgroundColor: C.primary,
    paddingBottom: 70,
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  ringOuter: {
    position: "absolute",
    width: width * 1.4,
    height: width * 1.4,
    borderRadius: width * 0.7,
    borderWidth: 1,
    borderColor: "rgba(197,160,89,0.08)",
    top: -width * 0.5,
    alignSelf: "center",
  },
  ringInner: {
    position: "absolute",
    width: width * 1.0,
    height: width * 1.0,
    borderRadius: width * 0.5,
    borderWidth: 1,
    borderColor: "rgba(197,160,89,0.12)",
    top: -width * 0.3,
    alignSelf: "center",
  },
  heroContent: {
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
    borderColor: C.secondary,
    padding: 3,
    marginBottom: 14,
    shadowColor: C.secondary,
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
    fontFamily: F.headline,
    fontSize: 36,
    color: C.secondary,
  },

  // Name / Email
  heroName: {
    fontFamily: F.headline,
    fontSize: 20,
    color: C.neutral,
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 2,
  },
  heroEmail: {
    fontFamily: F.light,
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 0.3,
  },

  // Badge
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 12,
    backgroundColor: "rgba(10,29,55,0.8)",
    borderWidth: 1.5,
    borderColor: C.secondary,
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  memberBadgeStar: { color: C.secondary, fontSize: 11 },
  memberBadgeText: {
    fontFamily: F.bold,
    fontSize: 11,
    color: C.secondary,
    letterSpacing: 2,
  },

  // ── Menu Card ──
  menuCard: {
    marginHorizontal: 18,
    marginTop: -36,
    backgroundColor: C.neutral,
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
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 14,
  },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(10,29,55,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  menuIconWrapDanger: { backgroundColor: C.dangerLight },
  menuIconEmoji: { fontSize: 17 },
  menuLabel: {
    flex: 1,
    fontFamily: F.body,
    fontSize: 15,
    color: C.textBody,
    letterSpacing: 0.1,
  },
  menuLabelDanger: { color: C.danger, fontFamily: F.bold },
  menuChevron: { fontSize: 20, color: C.textMuted, lineHeight: 24 },
  menuChevronDanger: { color: C.danger, opacity: 0.5 },
  menuDivider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginHorizontal: 16,
  },

  // ── Footer ──
  footer: {
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 8,
    gap: 4,
  },
  footerBrand: {
    fontFamily: F.bold,
    fontSize: 10,
    color: C.textMuted,
    letterSpacing: 2,
  },
  footerVersion: {
    fontFamily: F.light,
    fontSize: 11,
    color: C.secondary,
    letterSpacing: 0.5,
  },
});

export default ProfilePage;
