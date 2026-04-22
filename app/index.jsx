import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GlobeIcon from "../assets/icons/globe.svg";

const { width, height } = Dimensions.get("window");

const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  tertiary: "#E6BE7E",
  neutral: "#FFFFFF",
  overlay: "rgba(10, 29, 55, 0.55)",
  overlayDeep: "rgba(10, 29, 55, 0.80)",
  textMuted: "rgba(255,255,255,0.70)",
};

const FONTS = {
  headline: "NotoSerif-Light",
  headlineBold: "NotoSerif-Bold",
  body: "PlusJakartaSans-Regular",
  bodyLight: "PlusJakartaSans-Light",
  label: "PlusJakartaSans-Bold",
};

const Avatar = ({ index }) => (
  <View
    style={[
      styles.avatar,
      {
        backgroundColor: index === 0 ? "#4A6FA5" : "#7A9CC9",
        marginLeft: index === 0 ? 0 : -10,
      },
    ]}
  >
    <Text style={styles.avatarText}>{index === 0 ? "👤" : "👥"}</Text>
  </View>
);

const StarRating = ({ count = 5 }) => (
  <View style={styles.starsRow}>
    {Array.from({ length: count }).map((_, i) => (
      <Text key={i} style={styles.star}>
        ★
      </Text>
    ))}
  </View>
);

const Onboarding = () => {
  const router = useRouter();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const badgeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(badgeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    router.push("/pages/RegisterPage");
  };

  const handleLogin = () => {
    router.push("/pages/LoginPage");
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ImageBackground
        source={require("../assets/images/hero.png")}
        style={styles.heroImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            "rgba(35, 60, 95, 0.85)", // deep navy at top
            "rgba(10,29,55,0.55)", // mid transparency
            "rgba(10,29,55,0.25)", // lighter at bottom
          ]}
          locations={[0, 0.5, 1]} // control gradient stops
          style={StyleSheet.absoluteFillObject}
        />
      </ImageBackground>

      <View style={styles.heroImagePlaceholder}>
        {/* ── Header Bar ── */}
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <View style={styles.header}>
            <Text style={styles.brandName}>StayEase</Text>
            <TouchableOpacity style={styles.globeBtn} activeOpacity={0.8}>
              <GlobeIcon width={20} height={20} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* ── Hero Content ── */}
        <Animated.View
          style={[
            styles.heroContent,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.headline}>
            Experience{"\n"}Unparalleled{"\n"}Luxury
          </Text>
          <Text style={styles.subheadline}>
            Discover a curated selection of the world's most prestigious
            residences, tailored to your exquisite taste.
          </Text>
        </Animated.View>

        {/* ── CTA Area ── */}
        <Animated.View style={[styles.ctaArea, { opacity: buttonAnim }]}>
          <TouchableOpacity
            style={styles.getStartedBtn}
            onPress={handleGetStarted}
            activeOpacity={0.88}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <Text style={styles.getStartedArrow}> →</Text>
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Already have an account? </Text>
            <TouchableOpacity onPress={handleLogin} activeOpacity={0.7}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── Social Proof Badge ── */}
        <Animated.View style={[styles.badgeArea, { opacity: badgeAnim }]}>
          <View style={styles.divider} />
          <View style={styles.badge}>
            <View style={styles.avatarGroup}>
              <Avatar index={0} />
              <Avatar index={1} />
              <View
                style={[styles.avatar, styles.avatarCount, { marginLeft: -10 }]}
              >
                <Text style={styles.avatarCountText}>+2k</Text>
              </View>
            </View>
            <View style={styles.reviewInfo}>
              <StarRating count={5} />
              <Text style={styles.reviewLabel}>PREMIUM CLUB REVIEWS</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },

  heroImage: {
    width: width,
    height: height,
    position: "absolute",
    top: 0,
    left: 0,
  },

  // ── Hero Image / Placeholder ──

  heroImagePlaceholder: {
    flex: 1,
    position: "relative",
  },
  placeholderTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "45%",
    backgroundColor: "#1C2F4A",
  },
  placeholderMid: {
    position: "absolute",
    top: "20%",
    left: 0,
    right: 0,
    height: "45%",
    backgroundColor: "#2A3F5A",
    opacity: 0.6,
  },
  placeholderBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "45%",
    backgroundColor: COLORS.primary,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },

  // ── Header ──
  safeArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  brandName: {
    fontFamily: FONTS.headline,
    fontSize: 20,
    color: COLORS.secondary,
    letterSpacing: 0.5,
  },
  globeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  globeIcon: {
    fontSize: 16,
  },

  // ── Hero Content ──
  heroContent: {
    position: "absolute",
    bottom: 240,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  headline: {
    fontFamily: FONTS.headline,
    fontSize: 42,
    color: COLORS.neutral,
    lineHeight: 52,
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  subheadline: {
    fontFamily: FONTS.bodyLight,
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 22,
    maxWidth: 310,
  },

  // ── CTA Area ──
  ctaArea: {
    position: "absolute",
    bottom: 110,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  getStartedBtn: {
    backgroundColor: COLORS.secondary,
    borderRadius: 50,
    paddingVertical: 18,
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    marginBottom: 20,
  },
  getStartedText: {
    fontFamily: FONTS.label,
    fontSize: 16,
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
  getStartedArrow: {
    fontFamily: FONTS.label,
    fontSize: 18,
    color: COLORS.primary,
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginPrompt: {
    fontFamily: FONTS.body,
    fontSize: 13.5,
    color: COLORS.textMuted,
  },
  loginLink: {
    fontFamily: FONTS.label,
    fontSize: 13.5,
    color: COLORS.secondary,
    letterSpacing: 0.2,
  },

  // ── Social Proof Badge ──
  badgeArea: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginBottom: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarText: {
    fontSize: 16,
  },
  avatarCount: {
    backgroundColor: COLORS.primary,
    borderColor: "rgba(255,255,255,0.2)",
  },
  avatarCountText: {
    fontFamily: FONTS.label,
    fontSize: 9,
    color: COLORS.neutral,
  },
  reviewInfo: {
    gap: 2,
  },
  starsRow: {
    flexDirection: "row",
    gap: 1,
  },
  star: {
    color: COLORS.secondary,
    fontSize: 13,
  },
  reviewLabel: {
    fontFamily: FONTS.label,
    fontSize: 9,
    color: COLORS.textMuted,
    letterSpacing: 1.2,
  },
});

export default Onboarding;
