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
import StarRating from "../components/StarRating";
import useRoomStore from "../store/useRoomStore";
import { useAuth } from "@/context/AuthContext";
import { COLORS } from "../constants/colors";
import { POLICY_ICONS } from "../constants/mockData";
import { getRoomDetail } from "@/services/roomService";
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
import { extractErrorMessage } from "@/lib/errorUtils";

const diffNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const ms = checkOut.getTime() - checkIn.getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
};

const RoomDetail = () => {
  const router = useRouter();
  const params = useGlobalSearchParams();

  // FIX: roomId from URL params is always a string. Parse it once here so
  // every downstream use (API calls, comparisons) is consistent.
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

  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loadRoom = async () => {
      try {
        setIsLoading(true);
        const payload = await getRoomDetail(roomId);
        setRoom({
          ...payload,
          image: payload.image_urls?.[0]
            ? { uri: payload.image_urls[0] }
            : null,
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
      } catch (err) {
        console.error("Failed to load wishlist state:", err);
      }
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
        // reviewService now always returns a plain array
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load reviews:", err);
        setReviews([]);
      } finally {
        setIsReviewsLoading(false);
      }
    };
    loadReviews();
  }, [room?.id]);

  useEffect(() => {
    const loadCompletedBookings = async () => {
      if (!room?.id || !user) {
        setCompletedBookings([]);
        setIsLoadingBookings(false);
        return;
      }
      try {
        setIsLoadingBookings(true);
        // FIX: getUserCompletedBookingsForRoom now fetches detail objects
        // (which include booking_rooms) so the room membership filter works.
        const bookings = await getUserCompletedBookingsForRoom(room.id);
        setCompletedBookings(bookings);
      } catch (err) {
        console.error("Failed to load completed bookings:", err);
        setCompletedBookings([]);
      } finally {
        setIsLoadingBookings(false);
      }
    };
    loadCompletedBookings();
  }, [room?.id, user]);

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
      console.error("Wishlist toggle failed", err);
      Alert.alert("Error", "Could not update wishlist. Please try again.");
      setIsWishlisted((current) => !liked);
    }
  };

  // FIX: handleReviewSubmit no longer calls getBookingDetail again —
  // completedBookings already contains full detail objects (including
  // booking_rooms) because getUserCompletedBookingsForRoom now fetches them.
  // The redundant re-fetch and re-validation are removed; the backend
  // serializer enforces all constraints server-side anyway.
  const handleReviewSubmit = async (reviewData) => {
    try {
      setIsSubmittingReview(true);

      const candidateBooking = completedBookings[0];
      if (!candidateBooking) {
        Alert.alert(
          "No Eligible Booking",
          "You need a completed booking for this room before you can write a review.",
        );
        return;
      }

      // submitReview coerces room/booking to integers internally (see reviewService.js)
      await submitReview({
        room: room.id, // integer — parsed from roomId at top of component
        booking: candidateBooking.id, // integer — from full detail object
        rating: reviewData.rating,
        comment: reviewData.comment,
      });

      // Refresh reviews list
      const freshReviews = await getReviewsByRoom(room.id);
      setReviews(Array.isArray(freshReviews) ? freshReviews : []);

      setShowReviewForm(false);
      Alert.alert("Review Submitted", "Thank you for sharing your experience!");
    } catch (err) {
      // Surface the exact backend error (e.g. "You have already reviewed this booking.")
      const msg = extractErrorMessage(err);
      Alert.alert("Could Not Submit Review", msg);
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
          wishlisted={isWishlisted}
          onWishlist={handleWishlist}
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

          <SectionHeader title="Reviews" style={styles.sectionSpacing} />
          <View style={styles.reviewsSection}>
            {isReviewsLoading ? (
              <Text style={styles.loadingText}>Loading reviews...</Text>
            ) : (
              <View>
                {/* Header row */}
                <View style={styles.reviewsHeader}>
                  <Text style={styles.reviewsCount}>
                    {reviews.length}{" "}
                    {reviews.length === 1 ? "Review" : "Reviews"}
                  </Text>

                  {/* Write Review button — only shown when user has an
                      eligible completed booking AND is not already writing */}
                  {user && !showReviewForm && completedBookings.length > 0 && (
                    <TouchableOpacity
                      style={styles.writeReviewBtn}
                      onPress={() => setShowReviewForm(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.writeReviewBtnText}>
                        Write a Review
                      </Text>
                    </TouchableOpacity>
                  )}

                  {user && showReviewForm && (
                    <TouchableOpacity
                      style={[styles.writeReviewBtn, styles.cancelReviewBtn]}
                      onPress={() => setShowReviewForm(false)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.writeReviewBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Inline review form */}
                {showReviewForm && user && (
                  <View style={styles.inlineReviewForm}>
                    {/* FIX: roomId and bookingId are both passed so ReviewForm
                        has everything it needs. bookingId was previously
                        undefined because it was never passed as a prop. */}
                    <ReviewForm
                      roomId={room.id}
                      bookingId={completedBookings[0]?.id}
                      onSubmit={handleReviewSubmit}
                      onCancel={() => setShowReviewForm(false)}
                      isSubmitting={isSubmittingReview}
                    />
                  </View>
                )}

                {/* Empty state */}
                {reviews.length === 0 && !showReviewForm ? (
                  <View style={styles.emptyReviews}>
                    <Text style={styles.emptyReviewsTitle}>No reviews yet</Text>
                    {user && completedBookings.length === 0 ? (
                      <Text style={styles.emptyReviewsSubtitle}>
                        Complete a booking at this room to write a review!
                      </Text>
                    ) : user ? (
                      <Text style={styles.emptyReviewsSubtitle}>
                        Be the first to share your experience!
                      </Text>
                    ) : (
                      <Text style={styles.emptyReviewsSubtitle}>
                        Login to see reviews and write your own!
                      </Text>
                    )}
                  </View>
                ) : (
                  reviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      isOwner={review.user === user?.id}
                      onEdit={() => console.log("Edit review:", review.id)}
                      onDelete={() => console.log("Delete review:", review.id)}
                    />
                  ))
                )}
              </View>
            )}
          </View>

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
                  ? `Add to Booking Cart · ₱${(
                      parseFloat(room.price_per_night) * nights +
                      Math.round(
                        parseFloat(room.price_per_night) * nights * 0.1,
                      )
                    ).toLocaleString("en-PH")}`
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
  reviewsSection: {
    marginTop: 8,
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  reviewsCount: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 16,
    color: COLORS.primary,
  },
  emptyReviews: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyReviewsTitle: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 8,
  },
  emptyReviewsSubtitle: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 20,
  },
  writeReviewBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  cancelReviewBtn: {
    backgroundColor: COLORS.backgroundSoft,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  writeReviewBtnText: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 13,
    color: COLORS.neutral,
  },
  loadingText: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    paddingVertical: 20,
  },
  inlineReviewForm: {
    marginBottom: 24,
    backgroundColor: COLORS.backgroundSoft,
    borderRadius: 12,
    overflow: "hidden",
  },
});

export default RoomDetail;
