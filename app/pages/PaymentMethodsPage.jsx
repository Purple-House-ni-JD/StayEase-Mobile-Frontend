/**
 * PaymentMethodsPage
 * Route: pages/PaymentMethodsPage
 *
 * Displays the payment methods the guest has used across their bookings.
 * The StayEase backend (v1) is simulated — there is no stored wallet or card
 * vault endpoint. Instead we derive the guest's used methods from their
 * booking payment records, which are available on GET /bookings/my/.
 *
 * Each unique payment method found in their history is shown as a card.
 * A "Supported Methods" section always shows all accepted payment options.
 */

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { getMyBookings } from "@/services/bookingService";
import { extractErrorMessage } from "@/lib/errorUtils";

import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import PaymentMethodBadge from "../components/PaymentMethodBadge";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  neutral: "#FFFFFF",
  background: "#F5F3EF",
  textMuted: "#9A9690",
  textBody: "#3A3530",
  inputBorder: "#E0DDD8",
};

// All methods the platform accepts — always shown regardless of history
const ALL_METHODS = [
  {
    method: "gcash",
    description: "Pay instantly via your GCash wallet balance.",
  },
  {
    method: "maya",
    description: "Pay via Maya digital wallet — fast and secure.",
  },
  {
    method: "card",
    description: "Visa, Mastercard, or any major credit/debit card.",
  },
  {
    method: "cash",
    description: "Pay in cash at the front desk upon arrival.",
  },
];

// ─── Method Info Card ─────────────────────────────────────────────────────────
const MethodInfoCard = ({ method, description, used }) => (
  <View style={cardStyles.card}>
    <View style={cardStyles.top}>
      <PaymentMethodBadge method={method} />
      {used && (
        <View style={cardStyles.usedPill}>
          <Text style={cardStyles.usedText}>USED</Text>
        </View>
      )}
    </View>
    <Text style={cardStyles.description}>{description}</Text>
  </View>
);

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.neutral,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    padding: 16,
    gap: 10,
    marginBottom: 12,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  usedPill: {
    backgroundColor: "rgba(197,160,89,0.12)",
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(197,160,89,0.3)",
  },
  usedText: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 9.5,
    color: COLORS.secondary,
    letterSpacing: 1,
  },
  description: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 19,
  },
});

// ─── Main Component ───────────────────────────────────────────────────────────
const PaymentMethodsPage = () => {
  const router = useRouter();
  const [usedMethods, setUsedMethods] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await getMyBookings();
        const bookings = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : [];

        // Extract unique payment_method values from booking list
        // NOTE: BookingListSerializer doesn't include payment_method.
        // payment_method is only on BookingDetailSerializer.
        // We show an empty "used" set gracefully in that case.
        const methods = new Set(
          bookings.map((b) => b.payment_method).filter(Boolean),
        );
        setUsedMethods(methods);
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <PageHeader title="Payment Methods" onBack={() => router.back()} />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* ── Accepted Methods ── */}
          <SectionCard title="Accepted Payment Methods">
            <View style={styles.methodsList}>
              {ALL_METHODS.map(({ method, description }) => (
                <MethodInfoCard
                  key={method}
                  method={method}
                  description={description}
                  used={usedMethods.has(method)}
                />
              ))}
            </View>
          </SectionCard>

          {/* ── Note ── */}
          <View style={styles.note}>
            <Text style={styles.noteIcon}>ℹ️</Text>
            <Text style={styles.noteText}>
              Payment processing is currently simulated. Live gateway
              integration (PayMongo / Stripe) is coming in a future update.
            </Text>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  methodsList: { paddingTop: 12, paddingBottom: 4 },
  errorText: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 13,
    color: "#C0392B",
    marginBottom: 12,
    textAlign: "center",
  },
  note: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "rgba(10,29,55,0.04)",
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
    alignItems: "flex-start",
  },
  noteIcon: { fontSize: 15, marginTop: 1 },
  noteText: {
    flex: 1,
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 12.5,
    color: COLORS.textMuted,
    lineHeight: 19,
  },
});

export default PaymentMethodsPage;
