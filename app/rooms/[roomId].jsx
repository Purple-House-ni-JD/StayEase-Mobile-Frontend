import { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, useGlobalSearchParams } from "expo-router";

import ImageHero from "../components/ImageHero";
import RatingBadge from "../components/RatingBadge";
import PriceTag from "../components/PriceTag";
import AmenityChip from "../components/AmenityChip";
import SectionHeader from "../components/SectionHeader";
import CalendarPicker from "../components/CalendarPicker";
import PriceBreakdown from "../components/PriceBreakdown";
import useRoomStore from "../store/useRoomStore";
import { COLORS } from "../constants/colors";
import { POLICY_ICONS } from "../constants/mockData";
import { getRoomDetail } from "@/services/roomService";

const diffNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const ms = checkOut.getTime() - checkIn.getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
};

const RoomDetail = () => {
  const router = useRouter();
  const params = useGlobalSearchParams();
  const roomId = params.roomId;

  const addToCart = useRoomStore((state) => state.addToCart);

  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [added, setAdded] = useState(false);
  const [room, setRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loadRoom = async () => {
      try {
        setIsLoading(true);
        const payload = await getRoomDetail(roomId);
        setRoom({
          ...payload,
          image: payload.image_urls?.[0] ? { uri: payload.image_urls[0] } : null,
          review_count: 0,
          amenities: (payload.amenities || []).map((a) => ({
            id: a.id,
            icon: a.icon || "✓",
            label: a.name,
          })),
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (roomId) {
      loadRoom();
    }
  }, [roomId]);

  const nights = diffNights(checkIn, checkOut);
  const canBook = nights > 0 && room;

  const handleRangeChange = ({ checkIn: ci, checkOut: co }) => {
    setCheckIn(ci);
    setCheckOut(co);
    setAdded(false);
  };

  const handleAddToCart = () => {
    if (!canBook || !room) return;

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

    addToCart({ room, checkIn, checkOut, nights });
    setAdded(true);
  };

  if (!isLoading && !room) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Room not found</Text>
        <Text style={styles.emptySubtitle}>
          Please return to the home screen and choose another room.
        </Text>
        <TouchableOpacity
          style={styles.returnBtn}
          onPress={() => router.push("pages/HomePage")}
          activeOpacity={0.8}
        >
          <Text style={styles.returnText}>Return home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading || !room) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Loading room...</Text>
      </View>
    );
  }

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
        <ImageHero
          source={room.image}
          height={300}
          onBack={() => router.back()}
          onWishlist={(liked) => console.log("Wishlist:", liked)}
        />

        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{room.category}</Text>
          </View>

          <Text style={styles.roomName}>{room.name}</Text>

          <View style={styles.metaRow}>
            <RatingBadge rating={room.rating} reviewCount={room.review_count} />
            <PriceTag amount={room.price_per_night} size="lg" suffix="/night" />
          </View>

          <View style={styles.amenitiesRow}>
            {room.amenities.map((a) => (
              <AmenityChip key={a.id} icon={a.icon} label={a.label} />
            ))}
          </View>

          <SectionHeader title="Description" style={styles.sectionSpacing} />
          <Text
            style={styles.description}
            numberOfLines={expanded ? undefined : 4}
          >
            {room.description}
          </Text>
          <TouchableOpacity
            onPress={() => setExpanded((value) => !value)}
            activeOpacity={0.7}
            style={styles.expandBtn}
          >
            <Text style={styles.expandText}>
              {expanded ? "Show less ↑" : "Read more ↓"}
            </Text>
          </TouchableOpacity>

          <SectionHeader title="Select Dates" style={styles.sectionSpacing} />
          <CalendarPicker onRangeChange={handleRangeChange} />

          {canBook && (
            <PriceBreakdown
              pricePerNight={room.price_per_night}
              nights={nights}
              style={styles.sectionSpacing}
            />
          )}

          <SectionHeader title="Policies" style={styles.sectionSpacing} />
          <View style={styles.policiesList}>
            {room.policies.map((policy) => (
              <View key={policy.id} style={styles.policyRow}>
                <Text style={styles.policyIcon}>
                  {POLICY_ICONS[policy.type] ?? "ℹ️"}
                </Text>
                <View style={styles.policyText}>
                  <Text style={styles.policyTitle}>{policy.title}</Text>
                  <Text style={styles.policyDesc}>{policy.description}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={{ height: 32 }} />
        </View>
      </ScrollView>

      <View style={styles.ctaWrapper}>
        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <TouchableOpacity
            style={[styles.ctaBtn, !canBook && styles.ctaBtnDisabled]}
            onPress={handleAddToCart}
            activeOpacity={canBook ? 0.88 : 1}
            disabled={!canBook}
          >
            <Text style={styles.ctaIcon}>🛒</Text>
            <Text style={styles.ctaText}>
              {added
                ? "Added to cart"
                : canBook
                  ? `Add to Booking Cart · ₱${
                      room.price_per_night * nights +
                      Math.round(room.price_per_night * nights * 0.1)
                    }`
                  : "Select dates to continue"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
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
  badge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.badgeBg,
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 12,
  },
  badgeText: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 10.5,
    color: COLORS.badgeText,
    letterSpacing: 1.5,
  },
  roomName: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 24,
    color: COLORS.primary,
    lineHeight: 32,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  amenitiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 6,
  },
  sectionSpacing: {
    marginTop: 24,
  },
  description: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14,
    color: COLORS.textBody,
    lineHeight: 22,
  },
  expandBtn: {
    marginTop: 10,
  },
  expandText: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 13,
    color: COLORS.secondary,
  },
  policiesList: {
    gap: 12,
  },
  policyRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  policyIcon: {
    fontSize: 20,
    lineHeight: 24,
  },
  policyText: {
    flex: 1,
  },
  policyTitle: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 14,
    color: COLORS.primary,
  },
  policyDesc: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  ctaWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 10,
    backgroundColor: "rgba(245, 243, 239, 0.96)",
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 54,
    paddingVertical: 16,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  ctaBtnDisabled: {
    backgroundColor: "#B1B0AE",
  },
  ctaIcon: {
    fontSize: 18,
  },
  ctaText: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 15,
    color: COLORS.neutral,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: COLORS.background,
  },
  emptyTitle: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 22,
    color: COLORS.primary,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 18,
  },
  returnBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  returnText: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 14,
    color: COLORS.neutral,
  },
});

export default RoomDetail;
