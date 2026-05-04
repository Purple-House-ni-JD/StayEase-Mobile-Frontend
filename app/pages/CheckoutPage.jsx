import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

// ── Reusable components ───────────────────────────────────────────────────────
import StepIndicator from "../components/StepIndicator";
import BookingDetailCard from "../components/BookingDetailCard";
import FormField from "../components/FormField";
import PaymentMethodSelector from "../components/PaymentMethodSelector";
import useRoomStore from "../store/useRoomStore";
import { createBooking, createGuestBooking } from "@/services/bookingService";
import { extractErrorMessage } from "@/lib/errorUtils";
import { useAuth } from "@/context/AuthContext";
import TopBar from "../components/TopBar";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  neutral: "#FFFFFF",
  background: "#F5F3EF",
  inputBorder: "#E0DDD8",
  textMuted: "#9A9690",
  textBody: "#3A3530",
  navBg: "#0A1D37",
  error: "#DC2626",
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
// TODO: Replace with route params / cart context from BookingCartPage
const SERVICE_FEE_RATE = 0.1;

const PAYMENT_METHODS = [
  {
    id: "card",
    icon: "💳",
    label: "Credit / Debit Card",
    sublabel: "Visa, Mastercard, JCB",
  },
  {
    id: "gcash",
    icon: "📱",
    label: "GCash",
    sublabel: "E-Wallet Transfer",
  },
  {
    id: "maya",
    icon: "🏦",
    label: "Maya",
    sublabel: "E-Wallet Transfer",
  },
  {
    id: "cash",
    icon: "💵",
    label: "Cash on Arrival",
    sublabel: "Pay at front desk",
  },
];

const CHECKOUT_STEPS = ["CART", "PAYMENT", "CONFIRM"];

// ─── Validation ───────────────────────────────────────────────────────────────
const validate = (form) => {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = "Full name is required.";
  if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
    errors.email = "A valid email is required.";
  if (!form.phone.trim()) errors.phone = "Phone number is required.";
  return errors;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const CheckoutPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const cartItems = useRoomStore((state) => state.cart);

  // Form state
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    region: "Philippines",
  });
  const [errors, setErrors] = useState({});
  const [selectedPayment, setSelectedPayment] = useState("card");
  const [submitting, setSubmitting] = useState(false);

  // Entry animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  useRef(
    (() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
      ]).start();
    })(),
  );

  const setField = (key) => (value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const clearCart = useRoomStore((state) => state.clearCart);
  const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);

  const bookingDetail = {
    roomName: cartItems[0]?.name || "Selected rooms",
    nights: cartItems.reduce((sum, item) => sum + item.nights, 0),
    adults: 1,
    roomTotal: subtotal,
    serviceFee,
    currency: "$",
    image: cartItems[0]?.image,
  };

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      fullName:
        `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
        prev.fullName,
      email: user.email || prev.email,
      phone: user.phone_number || prev.phone,
    }));
  }, [user]);

  const handleConfirm = async () => {
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert("Empty cart", "Add at least one room before checkout.");
      return;
    }

    try {
      setSubmitting(true);

      const bookingParams = {
        room_ids: cartItems.map((item) => item.roomId),
        check_in: cartItems[0].checkIn.toISOString().split("T")[0],
        check_out: cartItems[0].checkOut.toISOString().split("T")[0],
        guest_count: 1,
        payment_method: selectedPayment,
      };

      let bookingResponse;

      if (user) {
        // Authenticated user booking
        bookingResponse = await createBooking(bookingParams);
      } else {
        // Guest booking - include guest details
        const guestDetails = {
          full_name: form.fullName,
          email: form.email,
          phone: form.phone,
          region: form.region,
        };
        bookingResponse = await createGuestBooking({
          ...bookingParams,
          guest_details: guestDetails,
        });
      }

      clearCart();

      // Pass booking data to confirmation page
      router.push({
        pathname: "pages/ConfirmationPage",
        params: {
          bookingData: encodeURIComponent(JSON.stringify(bookingResponse)),
        },
      });
    } catch (error) {
      Alert.alert("Checkout failed", extractErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <View style={styles.container}>
      <TopBar />
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Animated.ScrollView
          style={[
            styles.scroll,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Step Indicator ── */}
          <StepIndicator
            steps={CHECKOUT_STEPS}
            activeStep={1}
            style={styles.steps}
          />

          {/* ── Booking Details ── */}
          <BookingDetailCard booking={bookingDetail} style={styles.section} />

          {/* ── Guest Details ── */}
          <Text style={styles.sectionTitle}>Guest Details</Text>

          <FormField
            label="FULL NAME"
            placeholder="John Doe"
            value={form.fullName}
            onChangeText={setField("fullName")}
            autoCapitalize="words"
            error={errors.fullName}
            style={styles.field}
          />

          <FormField
            label="EMAIL ADDRESS"
            placeholder="john.doe@luxury.com"
            value={form.email}
            onChangeText={setField("email")}
            keyboardType="email-address"
            error={errors.email}
            style={styles.field}
          />

          {/* Phone + Region row */}
          <View style={styles.twoColRow}>
            <FormField
              label="PHONE"
              placeholder="+63 917 123 4567"
              value={form.phone}
              onChangeText={setField("phone")}
              keyboardType="phone-pad"
              error={errors.phone}
              style={styles.flexField}
            />
            <RegionPicker
              value={form.region}
              onChange={setField("region")}
              style={styles.regionField}
            />
          </View>

          {/* ── Payment Method ── */}
          <Text style={[styles.sectionTitle, styles.sectionSpacing]}>
            Payment Method
          </Text>
          <PaymentMethodSelector
            methods={PAYMENT_METHODS}
            selectedId={selectedPayment}
            onSelect={setSelectedPayment}
            style={styles.section}
          />

          {/* ── Terms ── */}
          <TermsText style={styles.terms} />

          <View style={{ height: 110 }} />
        </Animated.ScrollView>
      </KeyboardAvoidingView>

      {/* ── Fixed Confirm Button ── */}
      <ConfirmButton onPress={handleConfirm} loading={submitting} />
    </View>
  );
};

// ─── Sub-components (local — not worth separate files) ────────────────────────

/** Region picker — simple dropdown placeholder */
const RegionPicker = ({ value, onChange, style }) => (
  <View style={[style]}>
    <Text style={pickerStyles.label}>REGION</Text>
    <TouchableOpacity style={pickerStyles.picker} activeOpacity={0.8}>
      <Text style={pickerStyles.value}>{value}</Text>
      <Text style={pickerStyles.chevron}>⌄</Text>
    </TouchableOpacity>
  </View>
);

const pickerStyles = StyleSheet.create({
  label: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 10.5,
    color: "#5A5550",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  picker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 52,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: COLORS.neutral,
  },
  value: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14.5,
    color: COLORS.textBody,
  },
  chevron: {
    fontSize: 18,
    color: COLORS.textMuted,
    lineHeight: 22,
  },
});

/** Terms & conditions text with gold links */
const TermsText = ({ style }) => (
  <View style={[termsStyles.container, style]}>
    <Text style={termsStyles.text}>
      By clicking &quot;Confirm Booking&quot;, you agree to our{" "}
    </Text>
    <TouchableOpacity activeOpacity={0.7}>
      <Text style={termsStyles.link}>Terms of Service</Text>
    </TouchableOpacity>
    <Text style={termsStyles.text}> and </Text>
    <TouchableOpacity activeOpacity={0.7}>
      <Text style={termsStyles.link}>Cancellation Policy</Text>
    </TouchableOpacity>
    <Text style={termsStyles.text}>.</Text>
  </View>
);

const termsStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  text: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 12.5,
    color: COLORS.textMuted,
    lineHeight: 19,
  },
  link: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 12.5,
    color: COLORS.secondary,
    lineHeight: 19,
  },
});

/** Sticky confirm CTA */
const ConfirmButton = ({ onPress, loading }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 90,
        useNativeDriver: true,
      }),
    ]).start(() => onPress());
  };

  return (
    <View style={confirmStyles.wrapper}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[confirmStyles.btn, loading && confirmStyles.btnLoading]}
          onPress={handlePress}
          activeOpacity={0.88}
          disabled={loading}
        >
          <Text style={confirmStyles.text}>
            {loading ? "Processing..." : "Confirm Booking"}
          </Text>
          {!loading && <Text style={confirmStyles.lock}> 🔒</Text>}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const confirmStyles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(245,243,239,0.97)",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBorder,
  },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 50,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  btnLoading: {
    opacity: 0.7,
  },
  text: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 16,
    color: COLORS.neutral,
    letterSpacing: 0.2,
  },
  lock: {
    fontSize: 15,
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },

  // Navbar
  navbar: {
    backgroundColor: COLORS.navBg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 52,
    paddingBottom: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 20,
    color: COLORS.secondary,
    lineHeight: 24,
  },
  navBrand: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 20,
    color: COLORS.secondary,
    letterSpacing: 0.5,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 15,
    color: COLORS.primary,
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  // Steps
  steps: {
    marginBottom: 24,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 18,
    color: COLORS.primary,
    marginBottom: 16,
  },
  sectionSpacing: {
    marginTop: 8,
  },

  // Form fields
  field: {
    marginBottom: 16,
  },
  twoColRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  flexField: {
    flex: 1,
  },
  regionField: {
    width: 130,
  },

  // Terms
  terms: {
    marginTop: 8,
    marginBottom: 16,
  },
});

export default CheckoutPage;
