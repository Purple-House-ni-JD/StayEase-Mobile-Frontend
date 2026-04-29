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
  textMuted: "#9A9690",
  textBody: "#3A3530",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SERVICE_FEE_RATE = 0.1;

/**
 * Safely coerce any date-like value to a Date object.
 * Handles: Date instances, ISO strings, timestamps.
 */
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
const EmptyCart = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>🛏</Text>
    <Text style={styles.emptyTitle}>Your cart is empty</Text>
    <Text style={styles.emptySubtitle}>
      Browse our rooms and add your perfect stay.
    </Text>
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
  const contentSlide = useRef(new Animated.Value(20)).current;

  useRef(
    (() => {
      Animated.parallel([
        Animated.timing(contentFade, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(contentSlide, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
      ]).start();
    })(),
  );

  // ── Derived values ──────────────────────────────────────────────────────────
  const subtotal = calcSubtotal(cartItems);
  // FIX: Keep two decimal places throughout — Math.round() was dropping cents
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
        {/* Page heading */}
        <View style={styles.heading}>
          <Text style={styles.headingTitle}>Your Cart</Text>
          <Text style={styles.headingSubtitle}>
            Review your luxury selections
          </Text>
        </View>

        {isEmpty ? (
          <EmptyCart />
        ) : (
          <>
            {/* ── Cart Items ── */}
            <View style={styles.itemsList}>
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} onRemove={handleRemove} />
              ))}
            </View>

            {/* ── Promo Code ── */}
            <PromoCodeInput
              onApply={handlePromoApply}
              onRemove={handlePromoRemove}
              style={styles.promoSection}
            />

            {/* ── Order summary ── */}
            <View style={styles.summaryCard}>
              <SummaryRow label="Subtotal" value={`₱${subtotal.toFixed(2)}`} />
              <SummaryRow
                label="Service fee (10%)"
                value={`₱${serviceFee.toFixed(2)}`}
              />
              {discount > 0 && (
                <SummaryRow
                  label={`Promo (${appliedCode})`}
                  value={`-₱${discountAmt.toFixed(2)}`}
                  valueColor={COLORS.secondary}
                />
              )}
            </View>
          </>
        )}

        {/* Bottom padding for footer */}
        <View style={{ height: 220 }} />
      </Animated.ScrollView>

      {/* ── Summary Footer ── */}
      <View style={styles.footer}>
        <CartSummaryFooter
          total={isEmpty ? 0 : total}
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
const SummaryRow = ({ label, value, valueColor }) => (
  <View style={rowStyles.row}>
    <Text style={rowStyles.label}>{label}</Text>
    <Text style={[rowStyles.value, valueColor ? { color: valueColor } : null]}>
      {value}
    </Text>
  </View>
);

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  label: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14,
    color: COLORS.textBody,
  },
  value: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14,
    color: COLORS.textBody,
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
    paddingTop: 24,
  },
  scrollContentEmpty: {
    flex: 1,
  },

  // ── Heading ──
  heading: {
    marginBottom: 22,
  },
  headingTitle: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 28,
    color: COLORS.primary,
    letterSpacing: 0.2,
  },
  headingSubtitle: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // ── Cart items ──
  itemsList: {
    gap: 14,
    marginBottom: 28,
  },

  // ── Promo ──
  promoSection: {
    marginBottom: 22,
  },

  // ── Light summary card ──
  summaryCard: {
    backgroundColor: COLORS.neutral,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#E0DDD8",
  },

  // ── Empty state ──
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 56,
    opacity: 0.3,
  },
  emptyTitle: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 20,
    color: COLORS.primary,
    opacity: 0.6,
  },
  emptySubtitle: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    paddingHorizontal: 32,
  },

  // ── Footer ──
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default BookingCartPage;
