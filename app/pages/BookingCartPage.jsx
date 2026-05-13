import { useRef, useState } from "react";
import { Animated, StatusBar, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

// ── Reusable components ───────────────────────────────────────────────────────
import TopBar from "../components/TopBar";
import BottomNavBar from "../components/BottomNavBar";
import CartItem from "../components/CartItem";
import PromoCodeInput from "../components/PromoCodeInput";
import CartSummaryFooter from "../components/CartSummaryFooter";
import { NAV_TABS, navigateToTab } from "../constants/navigation";
import useRoomStore from "../store/useRoomStore";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  neutral: "#FFFFFF",
  background: "#F5F3EF",
  backgroundWarm: "#EFECE6",
  textMuted: "#9A9690",
  textBody: "#3A3530",
  divider: "#E0DDD8",
  accent: "#C5A059",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SERVICE_FEE_RATE = 0.1;

const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

const calcSubtotal = (items) =>
  items.reduce((sum, item) => {
    const inDate = toDate(item.checkIn);
    const outDate = toDate(item.checkOut);
    if (!inDate || !outDate) return sum;
    const nights = Math.max(
      0,
      Math.round(
        (outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );
    const price = parseFloat(item.pricePerNight) || 0;
    return sum + price * nights;
  }, 0);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyItinerary = () => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconWrap}>
      <Text style={styles.emptyIcon}>🏨</Text>
    </View>

    <Text style={styles.emptyTitle}>No Rooms Selected</Text>

    <Text style={styles.emptySubtitle}>
      Start exploring available rooms and build your next relaxing getaway.
    </Text>

    <View style={styles.emptyDashes}>
      <View style={[styles.dash, styles.dashShort]} />
      <View style={[styles.dash, styles.dashLong]} />
      <View style={[styles.dash, styles.dashShort]} />
    </View>
  </View>
);

// ─── Section Label ────────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <View style={styles.sectionLabelRow}>
    <View style={styles.sectionLabelLine} />
    <Text style={styles.sectionLabelText}>{children}</Text>
    <View style={styles.sectionLabelLine} />
  </View>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const BookingCartPage = () => {
  const router = useRouter();
  const cartItems = useRoomStore((state) => state.cart);
  const removeFromCart = useRoomStore((state) => state.removeFromCart);
  const [activeTab, setActiveTab] = useState("cart");
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState(null);

  // Entry animation
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(24)).current;

  useRef(
    (() => {
      Animated.parallel([
        Animated.timing(contentFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(contentSlide, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    })(),
  );

  // ── Derived values ──────────────────────────────────────────────────────────
  const subtotal = calcSubtotal(cartItems);
  const serviceFee = parseFloat((subtotal * SERVICE_FEE_RATE).toFixed(2));
  const discountAmt = parseFloat(
    ((subtotal + serviceFee) * discount).toFixed(2),
  );
  const total = parseFloat((subtotal + serviceFee - discountAmt).toFixed(2));
  const isEmpty = cartItems.length === 0;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleRemove = (id) => {
    removeFromCart(id);
  };

  const handlePromoApply = ({ code, discountRate }) => {
    setAppliedCode(code);
    setDiscount(discountRate);
  };

  const handlePromoRemove = () => {
    setAppliedCode(null);
    setDiscount(0);
  };

  const handleCheckout = () => {
    router.push("pages/CheckoutPage");
  };

  const handleTabSelect = (id) => {
    setActiveTab(id);
    navigateToTab(router, id);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* ── Navbar ── */}
      <TopBar />

      {/* ── Scrollable body ── */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isEmpty && styles.scrollContentEmpty,
        ]}
        style={[
          styles.scroll,
          { opacity: contentFade, transform: [{ translateY: contentSlide }] },
        ]}
      >
        {/* ── Page Heading ── */}
        <View style={styles.heading}>
          {/* Eyebrow label */}
          <Text style={styles.headingEyebrow}>
            {isEmpty
              ? "YOUR ROOMS"
              : `YOUR ROOMS · ${cartItems.length} ${cartItems.length === 1 ? "ROOM" : "ROOMS"}`}
          </Text>
          <Text style={styles.headingTitle}>
            {isEmpty ? "Your Stay Awaits" : "Review Your Stay"}
          </Text>
          {/* Gold accent bar */}
          <View style={styles.headingAccentBar} />
        </View>

        {isEmpty ? (
          <EmptyItinerary />
        ) : (
          <>
            {/* ── Rooms ── */}
            <SectionLabel>SELECTED ROOMS</SectionLabel>
            <View style={styles.itemsList}>
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} onRemove={handleRemove} />
              ))}
            </View>

            {/* ── Promo Code ── */}
            {/* <PromoCodeInput
              onApply={handlePromoApply}
              onRemove={handlePromoRemove}
              style={styles.promoSection}
            /> */}

            {/* ── Reservation Summary ── */}
            <SectionLabel>RESERVATION SUMMARY</SectionLabel>
            <View style={styles.summaryCard}>
              {/* Receipt-style rows */}
              <SummaryRow
                label="Room subtotal"
                value={`₱${subtotal.toFixed(2)}`}
              />
              <SummaryRow
                label="Service fee (10%)"
                value={`₱${serviceFee.toFixed(2)}`}
                muted
              />
              {discount > 0 && (
                <SummaryRow
                  label={`Promo · ${appliedCode}`}
                  value={`−₱${discountAmt.toFixed(2)}`}
                  valueColor={COLORS.secondary}
                />
              )}
              {/* Perforated divider */}
              <View style={styles.perforated}>
                <View style={styles.perforatedCircleLeft} />
                <View style={styles.perforatedDashes} />
                <View style={styles.perforatedCircleRight} />
              </View>
              {/* Total line inside card */}
              <View style={styles.summaryTotalRow}>
                <Text style={styles.summaryTotalLabel}>TOTAL DUE</Text>
                <Text style={styles.summaryTotalValue}>
                  ₱{total.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Subtle note */}
            <Text style={styles.taxNote}>
              Inclusive of all applicable taxes and fees
            </Text>
          </>
        )}

        {/* Bottom padding for footer */}
        <View style={{ height: 230 }} />
      </Animated.ScrollView>

      {/* ── Summary Footer ── */}
      <View style={styles.footer}>
        <CartSummaryFooter
          total={isEmpty ? 0 : total}
          label={isEmpty ? "Explore Rooms" : "Proceed to Checkout"}
          onPress={handleCheckout}
          disabled={isEmpty}
        />
        <BottomNavBar
          tabs={NAV_TABS}
          activeId={activeTab}
          onSelect={handleTabSelect}
        />
      </View>
    </View>
  );
};

// ─── Summary Row ─────────────────────────────────────────────────────────────
const SummaryRow = ({ label, value, valueColor, muted }) => (
  <View style={rowStyles.row}>
    <Text style={[rowStyles.label, muted && rowStyles.labelMuted]}>
      {label}
    </Text>
    <Text
      style={[
        rowStyles.value,
        muted && rowStyles.valueMuted,
        valueColor ? { color: valueColor } : null,
      ]}
    >
      {value}
    </Text>
  </View>
);

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
  },
  label: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14,
    color: COLORS.textBody,
  },
  labelMuted: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  value: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14,
    color: COLORS.textBody,
  },
  valueMuted: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  scrollContentEmpty: {
    flex: 1,
  },

  // ── Heading ──
  heading: {
    marginBottom: 28,
  },
  headingEyebrow: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 10,
    letterSpacing: 2.5,
    color: COLORS.secondary,
    marginBottom: 6,
  },
  headingTitle: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 30,
    color: COLORS.primary,
    letterSpacing: 0.2,
    lineHeight: 36,
  },
  headingAccentBar: {
    marginTop: 12,
    width: 36,
    height: 2,
    backgroundColor: COLORS.secondary,
    borderRadius: 2,
  },

  // ── Section label ──
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
    marginTop: 4,
  },
  sectionLabelLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.divider,
  },
  sectionLabelText: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 9.5,
    letterSpacing: 2,
    color: COLORS.textMuted,
  },

  // ── Cart items ──
  itemsList: {
    gap: 14,
    marginBottom: 28,
  },

  // ── Promo ──
  promoSection: {
    marginBottom: 28,
  },

  // ── Summary card — receipt style ──
  summaryCard: {
    backgroundColor: COLORS.neutral,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.divider,
    marginBottom: 10,
    overflow: "hidden",
  },
  // Perforated tear-off divider
  perforated: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    marginHorizontal: -18,
  },
  perforatedCircleLeft: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.divider,
    marginLeft: -8,
  },
  perforatedCircleRight: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.divider,
    marginRight: -8,
  },
  perforatedDashes: {
    flex: 1,
    height: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  // Total inside the card
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 2,
  },
  summaryTotalLabel: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 10,
    letterSpacing: 2,
    color: COLORS.textMuted,
  },
  summaryTotalValue: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 22,
    color: COLORS.primary,
    letterSpacing: 0.3,
  },

  // Tax note
  taxNote: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 11.5,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 8,
    letterSpacing: 0.2,
  },

  // ── Empty state ──
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 14,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    borderColor: COLORS.divider,
    backgroundColor: COLORS.neutral,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyIcon: {
    fontSize: 30,
  },
  emptyTitle: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 22,
    color: COLORS.primary,
    letterSpacing: 0.2,
  },
  emptySubtitle: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 21,
    paddingHorizontal: 24,
  },
  emptyDashes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    opacity: 0.35,
  },
  dash: {
    height: 1.5,
    backgroundColor: COLORS.secondary,
    borderRadius: 1,
  },
  dashShort: { width: 16 },
  dashLong: { width: 32 },

  // ── Footer ──
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default BookingCartPage;
