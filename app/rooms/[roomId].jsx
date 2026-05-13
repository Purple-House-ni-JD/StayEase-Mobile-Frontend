import { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { useRouter, useGlobalSearchParams } from "expo-router";

import ImageHero from "../components/ImageHero";
import RatingBadge from "../components/RatingBadge";
import PriceTag from "../components/PriceTag";
import AmenityChip from "../components/AmenityChip";
import SectionHeader from "../components/SectionHeader";
import CalendarPicker from "../components/CalendarPicker";
import PriceBreakdown from "../components/PriceBreakdown";
import ReviewCard from "../components/ReviewCard";
import ReviewForm from "../components/ReviewForm";
import useRoomStore from "../store/useRoomStore";
import { useAuth } from "@/context/AuthContext";
import { COLORS } from "../constants/colors";
import { POLICY_ICONS } from "../constants/mockData";
import { getRoomDetail, getRoomBookedDates } from "@/services/roomService";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "@/services/wishlistService";
import {
  getReviewsByRoom,
  submitReview,
  getUserCompletedBookingsForRoom,
} from "@/services/reviewService";

const diffNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const ms = checkOut.getTime() - checkIn.getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
};

const findEligibleBooking = (bookings, roomId) =>
  bookings.find((b) =>
    b?.booking_rooms?.some(
      (br) => String(br.room?.id ?? br.room) === String(roomId),
    ),
  ) ?? null;

// ─── Divider ──────────────────────────────────────────────────────────────────
const Divider = ({ style }) => <View style={[dividerStyles.line, style]} />;
const dividerStyles = StyleSheet.create({
  line: {
    height: 1,
    backgroundColor: COLORS.inputBorder,
    marginVertical: 24,
  },
});

// ─── Section Label ─────────────────────────────────────────────────────────────
const SectionLabel = ({ children, style }) => (
  <Text style={[sectionLabelStyles.text, style]}>{children}</Text>
);
const sectionLabelStyles = StyleSheet.create({
  text: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 10,
    letterSpacing: 2.5,
    color: COLORS.secondary,
    textTransform: "uppercase",
    marginBottom: 14,
  },
});

// ─── Policy Row ────────────────────────────────────────────────────────────────
const PolicyRow = ({ icon, title, description }) => (
  <View style={policyStyles.row}>
    <View style={policyStyles.iconWrap}>
      <Text style={policyStyles.icon}>{icon}</Text>
    </View>
    <View style={policyStyles.textWrap}>
      <Text style={policyStyles.title}>{title}</Text>
      <Text style={policyStyles.desc}>{description}</Text>
    </View>
  </View>
);
const policyStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.badgeBg,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 16,
    lineHeight: 20,
  },
  textWrap: {
    flex: 1,
    paddingTop: 1,
  },
  title: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 13,
    color: COLORS.primary,
    marginBottom: 2,
  },
  desc: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 12.5,
    color: COLORS.textMuted,
    lineHeight: 19,
  },
});

// ─── Main Component ────────────────────────────────────────────────────────────
const RoomDetail = () => {
  const router = useRouter();
  const params = useGlobalSearchParams();
  const roomId = parseInt(params.roomId, 10);

  const addToCart = useRoomStore((state) => state.addToCart);
  const { user } = useAuth();

  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [added, setAdded] = useState(false);
  const [room, setRoom] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [bookedDates, setBookedDates] = useState([]);
  const [reviewedBookingIds, setReviewedBookingIds] = useState(new Set());

  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loadRoom = async () => {
      try {
        setIsLoading(true);
        const payload = await getRoomDetail(roomId);
        setRoom({
          ...payload,
          image_urls: payload.image_urls || [],
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
    if (roomId) loadRoom();
  }, [roomId]);

  useEffect(() => {
    const loadWishlistState = async () => {
      if (!room?.id || !user) {
        setIsWishlisted(false);
        return;
      }
      try {
        const data = await getWishlist();
        const raw = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : [];
        setIsWishlisted(
          raw.some((item) => String(item.room?.id) === String(room.id)),
        );
      } catch (err) {}
    };
    loadWishlistState();
  }, [room?.id, user]);

  useEffect(() => {
    const loadReviews = async () => {
      if (!room?.id) {
        setReviews([]);
        setIsReviewsLoading(false);
        return;
      }
      try {
        setIsReviewsLoading(true);
        const data = await getReviewsByRoom(room.id);
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        setReviews([]);
      } finally {
        setIsReviewsLoading(false);
      }
    };
    loadReviews();
  }, [room?.id]);

  useEffect(() => {
    const loadBookedDates = async () => {
      if (!room?.id) {
        setBookedDates([]);
        return;
      }
      try {
        const dates = await getRoomBookedDates(room.id);
        setBookedDates(dates);
      } catch (err) {
        setBookedDates([]);
      }
    };
    loadBookedDates();
  }, [room?.id]);

  useEffect(() => {
    const loadCompletedBookings = async () => {
      if (!room?.id || !user) {
        setCompletedBookings([]);
        return;
      }
      try {
        setIsLoadingBookings(true);
        const bookings = await getUserCompletedBookingsForRoom(room.id);
        setCompletedBookings(bookings);
      } catch (err) {
        setCompletedBookings([]);
      } finally {
        setIsLoadingBookings(false);
      }
    };
    loadCompletedBookings();
  }, [room?.id, user]);

  const nights = diffNights(checkIn, checkOut);
  const canBook = nights > 0 && !!room;

  const eligibleBooking = findEligibleBooking(
    completedBookings.filter((b) => !reviewedBookingIds.has(b.id)),
    roomId,
  );

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
    router.push("pages/BookingCartPage");
  };

  const handleWishlist = async (liked) => {
    if (!room?.id) return;
    if (!user) {
      Alert.alert(
        "Login Required",
        "Please log in to add rooms to your wishlist.",
      );
      return;
    }
    try {
      if (liked) {
        await addToWishlist(room.id);
      } else {
        await removeFromWishlist(room.id);
      }
      setIsWishlisted(liked);
    } catch (err) {
      Alert.alert("Error", "Could not update wishlist. Please try again.");
      setIsWishlisted((current) => !liked);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    if (!eligibleBooking) {
      Alert.alert(
        "No Eligible Booking",
        "You need a completed booking for this room before you can write a review.",
      );
      return;
    }

    try {
      setIsSubmittingReview(true);

      await submitReview({
        room: room.id,
        booking: eligibleBooking.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });

      setReviewedBookingIds((prev) => new Set([...prev, eligibleBooking.id]));

      const freshReviews = await getReviewsByRoom(room.id);
      setReviews(Array.isArray(freshReviews) ? freshReviews : []);

      setShowReviewForm(false);
      Alert.alert("Review Submitted", "Thank you for sharing your experience!");
    } catch (err) {
      Alert.alert("Could Not Submit Review", err.message);
    } finally {
      setIsSubmittingReview(false);
    }
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

  const totalPrice =
    parseFloat(room.price_per_night) * nights +
    Math.round(parseFloat(room.price_per_night) * nights * 0.1);

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
        {/* ── Hero ── */}
        <ImageHero
          sources={room.image_urls}
          height={340}
          onBack={() => router.back()}
          wishlisted={isWishlisted}
          onWishlist={handleWishlist}
        />

        {/* ── Content Card ── */}
        <View style={styles.card}>
          {/* Category + Availability row */}
          <View style={styles.topMeta}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {room.category_display ?? room.category}
              </Text>
            </View>
            <View
              style={[
                styles.availabilityDot,
                room.availability_status
                  ? styles.dotAvailable
                  : styles.dotUnavailable,
              ]}
            >
              <View
                style={[
                  styles.dotInner,
                  room.availability_status
                    ? styles.dotInnerAvailable
                    : styles.dotInnerUnavailable,
                ]}
              />
              <Text
                style={[
                  styles.availabilityText,
                  room.availability_status
                    ? styles.available
                    : styles.notAvailable,
                ]}
              >
                {room.availability_status ? "Available" : "Unavailable"}
              </Text>
            </View>
          </View>

          {/* Room name */}
          <Text style={styles.roomName}>{room.name}</Text>

          {/* Rating + Price row */}
          <View style={styles.ratingPriceRow}>
            <RatingBadge rating={room.rating} reviewCount={room.review_count} />
            <PriceTag amount={room.price_per_night} size="lg" suffix="/night" />
          </View>

          {/* Capacity pill */}
          <View style={styles.guestRow}>
            <View style={styles.guestPill}>
              <Text style={styles.guestIcon}>👤</Text>
              <Text style={styles.guestText}>
                Up to {room.max_guest} guests
              </Text>
            </View>
          </View>

          <Divider />

          {/* ── Amenities ── */}
          <SectionLabel>Amenities</SectionLabel>
          <View style={styles.amenitiesGrid}>
            {room.amenities.map((a) => (
              <AmenityChip
                key={a.id}
                icon={a.icon}
                label={a.label}
                style={styles.amenityChip}
              />
            ))}
          </View>

          <Divider />

          {/* ── Description ── */}
          <SectionLabel>About this room</SectionLabel>
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

          <Divider />

          {/* ── Select Dates ── */}
          <SectionLabel>Select dates</SectionLabel>
          <CalendarPicker
            onRangeChange={handleRangeChange}
            disabledDates={bookedDates}
          />

          {canBook && (
            <PriceBreakdown
              pricePerNight={room.price_per_night}
              nights={nights}
              style={styles.priceBreakdown}
            />
          )}

          <Divider />

          {/* ── Reviews ── */}
          <View style={styles.reviewsHeader}>
            <SectionLabel style={{ marginBottom: 0 }}>
              {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
            </SectionLabel>

            {user && !showReviewForm && eligibleBooking && (
              <TouchableOpacity
                style={styles.writeReviewBtn}
                onPress={() => setShowReviewForm(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.writeReviewBtnText}>✦ Write a Review</Text>
              </TouchableOpacity>
            )}

            {user && showReviewForm && (
              <TouchableOpacity
                style={[styles.writeReviewBtn, styles.cancelReviewBtn]}
                onPress={() => setShowReviewForm(false)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.writeReviewBtnText,
                    styles.cancelReviewBtnText,
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.reviewsSection}>
            {isReviewsLoading ? (
              <Text style={styles.loadingText}>Loading reviews…</Text>
            ) : (
              <View>
                {showReviewForm && user && (
                  <View style={styles.inlineReviewForm}>
                    <ReviewForm
                      roomId={room.id}
                      bookingId={eligibleBooking?.id}
                      onSubmit={handleReviewSubmit}
                      onCancel={() => setShowReviewForm(false)}
                      isSubmitting={isSubmittingReview}
                    />
                  </View>
                )}

                {reviews.length === 0 && !showReviewForm ? (
                  <View style={styles.emptyReviews}>
                    <Text style={styles.emptyReviewsTitle}>No reviews yet</Text>
                    {user && completedBookings.length === 0 ? (
                      <Text style={styles.emptyReviewsSubtitle}>
                        Complete a booking at this room to write a review.
                      </Text>
                    ) : user ? (
                      <Text style={styles.emptyReviewsSubtitle}>
                        Be the first to share your experience.
                      </Text>
                    ) : (
                      <Text style={styles.emptyReviewsSubtitle}>
                        Log in to see and write reviews.
                      </Text>
                    )}
                  </View>
                ) : (
                  reviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      isOwner={review.user === user?.id}
                      onEdit={() => {}}
                      onDelete={() => {}}
                    />
                  ))
                )}
              </View>
            )}
          </View>

          <Divider />

          {/* ── Policies ── */}
          <SectionLabel>House policies</SectionLabel>
          <View style={styles.policiesList}>
            {room.policies.map((policy, idx) => (
              <PolicyRow
                key={policy.id}
                icon={POLICY_ICONS[policy.type] ?? "ℹ️"}
                title={policy.title}
                description={policy.description}
              />
            ))}
          </View>

          <View style={{ height: 16 }} />
        </View>
      </ScrollView>

      {/* ── CTA Bar ── */}
      <View style={styles.ctaWrapper}>
        {canBook && (
          <View style={styles.ctaNightsSummary}>
            <Text style={styles.ctaNightsText}>
              {nights} night{nights !== 1 ? "s" : ""}
            </Text>
            <Text style={styles.ctaTotalText}>
              ₱{totalPrice.toLocaleString("en-PH")} total
            </Text>
          </View>
        )}
        <Animated.View
          style={[styles.ctaBtnWrap, { transform: [{ scale: btnScale }] }]}
        >
          <TouchableOpacity
            style={[styles.ctaBtn, !canBook && styles.ctaBtnDisabled]}
            onPress={handleAddToCart}
            activeOpacity={canBook ? 0.88 : 1}
            disabled={!canBook}
          >
            <Text style={styles.ctaText}>
              {canBook ? "Review & Pay" : "Select dates to continue"}
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
    paddingBottom: 130,
  },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: COLORS.neutral,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -6 },
    elevation: 10,
  },

  // ── Top meta ──────────────────────────────────────────────────────────────
  topMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  badge: {
    backgroundColor: COLORS.badgeBg,
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeText: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 10,
    color: COLORS.badgeText,
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  availabilityDot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dotInner: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotInnerAvailable: {
    backgroundColor: "#2ECC71",
  },
  dotInnerUnavailable: {
    backgroundColor: COLORS.textMuted,
  },
  availabilityText: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 12,
  },
  available: {
    color: "#2ECC71",
  },
  notAvailable: {
    color: COLORS.textMuted,
  },

  // ── Room name ──────────────────────────────────────────────────────────────
  roomName: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 26,
    color: COLORS.primary,
    lineHeight: 34,
    marginBottom: 14,
    letterSpacing: -0.3,
  },

  // ── Rating + price ─────────────────────────────────────────────────────────
  ratingPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  // ── Guest capacity ─────────────────────────────────────────────────────────
  guestRow: {
    flexDirection: "row",
  },
  guestPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  guestIcon: {
    fontSize: 13,
  },
  guestText: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 12.5,
    color: COLORS.textBody,
  },

  // ── Amenities ──────────────────────────────────────────────────────────────
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  amenityChip: {
    // slight override — let AmenityChip handle its own internal style
  },

  // ── Description ───────────────────────────────────────────────────────────
  description: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14,
    color: COLORS.textBody,
    lineHeight: 23,
  },
  expandBtn: {
    marginTop: 10,
  },
  expandText: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 13,
    color: COLORS.secondary,
  },

  // ── Price breakdown spacing ────────────────────────────────────────────────
  priceBreakdown: {
    marginTop: 16,
  },

  // ── Reviews ───────────────────────────────────────────────────────────────
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  reviewsSection: {
    // container
  },
  emptyReviews: {
    alignItems: "center",
    paddingVertical: 28,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  emptyReviewsTitle: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 15,
    color: COLORS.primary,
    marginBottom: 6,
  },
  emptyReviewsSubtitle: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  writeReviewBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cancelReviewBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  writeReviewBtnText: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 11.5,
    color: COLORS.neutral,
    letterSpacing: 0.3,
  },
  cancelReviewBtnText: {
    color: COLORS.textBody,
  },
  loadingText: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    paddingVertical: 20,
  },
  inlineReviewForm: {
    marginBottom: 20,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },

  // ── Policies ──────────────────────────────────────────────────────────────
  policiesList: {
    // last item border will show — fine
  },

  // ── CTA bar ───────────────────────────────────────────────────────────────
  ctaWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 12,
    backgroundColor: "rgba(255, 255, 255, 0.97)",
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBorder,
    gap: 10,
  },
  ctaNightsSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  ctaNightsText: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 13,
    color: COLORS.textMuted,
  },
  ctaTotalText: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 15,
    color: COLORS.primary,
  },
  ctaBtnWrap: {
    // wrap for animation
  },
  ctaBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  ctaBtnDisabled: {
    backgroundColor: "#C8C7C5",
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaText: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 15,
    color: COLORS.neutral,
    letterSpacing: 0.2,
  },

  // ── Empty / loading states ─────────────────────────────────────────────────
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
