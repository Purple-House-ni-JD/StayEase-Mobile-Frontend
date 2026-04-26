import { useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import useRoomStore from "../store/useRoomStore";

// ── Reusable components ───────────────────────────────────────────────────────
import ImageHero from "../components/ImageHero";
import RatingBadge from "../components/RatingBadge";
import PriceTag from "../components/PriceTag";
import AmenityChip from "../components/AmenityChip";
import SectionHeader from "../components/SectionHeader";
import CalendarPicker from "../components/CalendarPicker";
import PriceBreakdown from "../components/PriceBreakdown";
import { COLORS, FONTS } from "../constants/colors";
import { MOCK_ROOM, POLICY_ICONS } from "../constants/mockData";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const diffNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const ms = checkOut.getTime() - checkIn.getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
};

// ─── Main Component ───────────────────────────────────────────────────────────
const RoomDetailPage = () => {
  const router = useRouter();
  const room = MOCK_ROOM; // TODO: replace with route param + API fetch
  const addToCart = useRoomStore((state) => state.addToCart);

  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const btnScale = useRef(new Animated.Value(1)).current;

  const nights = diffNights(checkIn, checkOut);
  const canBook = nights > 0;

  const handleRangeChange = ({ checkIn: ci, checkOut: co }) => {
    setCheckIn(ci);
    setCheckOut(co);
  };

  const handleAddToCart = () => {
    if (!canBook) return;

    Animated.sequence([
      Animated.timing(btnScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(btnScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Add to cart using store
    addToCart({ room, checkIn, checkOut, nights });
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Hero Image ── */}
        <ImageHero
          // source={room.image}        // ← uncomment when using real image
          height={300}
          onBack={() => router.back()}
          onWishlist={(liked) => console.log("Wishlist:", liked)} // TODO: Implement wishlist functionality
        />

        {/* ── Content Card ── */}
        <View style={styles.card}>
          {/* Category badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{room.category}</Text>
          </View>

          {/* Room name */}
          <Text style={styles.roomName}>{room.name}</Text>

          {/* Rating + Price row */}
          <View style={styles.metaRow}>
            <RatingBadge rating={room.rating} reviewCount={room.review_count} />
            <PriceTag amount={room.price_per_night} size="lg" suffix="/night" />
          </View>

          {/* ── Amenities ── */}
          <View style={styles.amenitiesRow}>
            {room.amenities.map((a) => (
              <AmenityChip key={a.id} icon={a.icon} label={a.label} />
            ))}
          </View>

          {/* ── Description ── */}
          <SectionHeader title="Description" style={styles.sectionSpacing} />
          <Text
            style={styles.description}
            numberOfLines={expanded ? undefined : 4}
          >
            {room.description}
          </Text>
          <TouchableOpacity
            onPress={() => setExpanded((v) => !v)}
            activeOpacity={0.7}
            style={styles.expandBtn}
          >
            <Text style={styles.expandText}>
              {expanded ? "Show less ↑" : "Read more ↓"}
            </Text>
          </TouchableOpacity>

          {/* ── Select Dates ── */}
          <SectionHeader title="Select Dates" style={styles.sectionSpacing} />
          <CalendarPicker onRangeChange={handleRangeChange} />

          {/* ── Price Breakdown ── */}
          {canBook && (
            <PriceBreakdown
              pricePerNight={room.price_per_night}
              nights={nights}
              style={styles.sectionSpacing}
            />
          )}

          {/* ── Policies ── */}
          <SectionHeader title="Policies" style={styles.sectionSpacing} />
          <View style={styles.policiesList}>
            {room.policies.map((p) => (
              <View key={p.id} style={styles.policyRow}>
                <Text style={styles.policyIcon}>
                  {POLICY_ICONS[p.type] ?? "ℹ️"}
                </Text>
                <View style={styles.policyText}>
                  <Text style={styles.policyTitle}>{p.title}</Text>
                  <Text style={styles.policyDesc}>{p.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Bottom spacing for fixed button */}
          <View style={{ height: 32 }} />
        </View>
      </ScrollView>

      {/* ── Fixed Add to Cart Button ── */}
      <View style={styles.ctaWrapper}>
        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <TouchableOpacity
            style={[styles.ctaBtn, !canBook && styles.ctaBtnDisabled]}
            onPress={handleAddToCart}
            activeOpacity={canBook ? 0.88 : 1}
          >
            <Text style={styles.ctaIcon}>🛒</Text>
            <Text style={styles.ctaText}>
              {canBook
                ? `Add to Booking Cart · $${room.price_per_night * nights + Math.round(room.price_per_night * nights * 0.1)}`
                : "Select dates to continue"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  // ── Card ──
  card: {
    backgroundColor: COLORS.neutral,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },

  // ── Badge ──
  badge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.badgeBg,
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 12,
  },
  badgeText: {
    fontFamily: FONTS.label,
    fontSize: 10.5,
    color: COLORS.badgeText,
    letterSpacing: 1.5,
  },

  // ── Room name ──
  roomName: {
    fontFamily: FONTS.headline,
    fontSize: 24,
    color: COLORS.primary,
    lineHeight: 32,
    marginBottom: 12,
  },

  // ── Meta row ──
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  // ── Amenities ──
  amenitiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 6,
  },

  // ── Section spacing ──
  sectionSpacing: {
    marginTop: 24,
  },

  // ── Description ──
  description: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textBody,
    lineHeight: 22,
  },
  expandBtn: {
    marginTop: 8,
  },
  expandText: {
    fontFamily: FONTS.label,
    fontSize: 13,
    color: COLORS.secondary,
  },

  // ── Policies ──
  policiesList: {
    gap: 14,
  },
  policyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  policyIcon: {
    fontSize: 18,
    marginTop: 1,
  },
  policyText: {
    flex: 1,
  },
  policyTitle: {
    fontFamily: FONTS.label,
    fontSize: 13.5,
    color: COLORS.primary,
    marginBottom: 2,
  },
  policyDesc: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textBody,
    lineHeight: 19,
  },

  // ── CTA Button ──
  ctaWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBorder,
  },
  ctaBtn: {
    backgroundColor: COLORS.secondary,
    borderRadius: 50,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  ctaBtnDisabled: {
    backgroundColor: COLORS.inputBorder,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaIcon: {
    fontSize: 16,
  },
  ctaText: {
    fontFamily: FONTS.label,
    fontSize: 15,
    color: COLORS.neutral,
    letterSpacing: 0.2,
  },
});

export default RoomDetailPage;
