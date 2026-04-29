/**
 * HelpSupportPage
 * Route: pages/HelpSupportPage
 *
 * Static FAQ accordion + contact options.
 * No backend required — all content is local.
 */

import {
  Animated,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRef, useState } from "react";
import { useRouter } from "expo-router";

import TopBar from "../components/TopBar";
import SectionCard from "../components/SectionCard";

// ─── Constants ────────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  neutral: "#FFFFFF",
  background: "#F5F3EF",
  textMuted: "#9A9690",
  textBody: "#3A3530",
  inputBorder: "#E0DDD8",
};

const FONTS = {
  body: "PlusJakartaSans-Regular",
  bold: "PlusJakartaSans-Bold",
  light: "PlusJakartaSans-Light",
};

// ─── Static data ──────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    id: "cancel",
    question: "How do I cancel a booking?",
    answer:
      "Open My Bookings, tap the booking you want to cancel, then tap 'Cancel Booking'. Cancellations are free up to 48 hours before check-in.",
  },
  {
    id: "refund",
    question: "When will I receive my refund?",
    answer:
      "Refunds are processed within 3–5 business days after cancellation approval, returned to the original payment method.",
  },
  {
    id: "checkin",
    question: "What is the check-in time?",
    answer:
      "Standard check-in is from 2:00 PM. Early check-in may be available upon request, subject to room availability.",
  },
  {
    id: "checkout",
    question: "What is the check-out time?",
    answer:
      "Check-out is until 12:00 PM (noon). Late check-out requests may incur an additional fee.",
  },
  {
    id: "payment",
    question: "What payment methods are accepted?",
    answer:
      "We accept GCash, Maya, credit/debit cards (Visa & Mastercard), and cash on arrival.",
  },
  {
    id: "modify",
    question: "Can I modify my booking dates?",
    answer:
      "Date modifications aren't yet available in the app. Please contact our support team for assistance.",
  },
  {
    id: "pets",
    question: "Are pets allowed?",
    answer: "Pets are not permitted in any rooms or common areas at this time.",
  },
];

const CONTACT_ITEMS = [
  {
    id: "email",
    icon: "✉️",
    label: "Email Support",
    value: "support@stayease.ph",
    onPress: () => Linking.openURL("mailto:support@stayease.ph"),
  },
  {
    id: "phone",
    icon: "📞",
    label: "Call Us",
    value: "+63 (88) 123-4567",
    onPress: () => Linking.openURL("tel:+63881234567"),
  },
  {
    id: "hours",
    icon: "🕐",
    label: "Support Hours",
    value: "Mon – Sat, 8 AM – 8 PM",
    onPress: null,
  },
];

// ─── FaqItem ──────────────────────────────────────────────────────────────────
const FaqItem = ({ question, answer, isLast }) => {
  const [open, setOpen] = useState(false);
  const heightAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    const toValue = open ? 0 : 1;
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue,
        duration: 240,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue,
        duration: 220,
        useNativeDriver: false,
      }),
      Animated.timing(rotateAnim, {
        toValue,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start();
    setOpen(!open);
  };

  const maxHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });

  return (
    <View style={[faqStyles.item, !isLast && faqStyles.itemDivider]}>
      <TouchableOpacity
        onPress={toggle}
        activeOpacity={0.75}
        style={faqStyles.questionRow}
      >
        <Text style={faqStyles.questionText}>{question}</Text>
        <Animated.Text style={[faqStyles.chevron, { transform: [{ rotate }] }]}>
          ›
        </Animated.Text>
      </TouchableOpacity>

      <Animated.View
        style={{ maxHeight, opacity: opacityAnim, overflow: "hidden" }}
      >
        <Text style={faqStyles.answerText}>{answer}</Text>
      </Animated.View>
    </View>
  );
};

const faqStyles = StyleSheet.create({
  item: { paddingVertical: 2 },
  itemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  questionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    gap: 12,
  },
  questionText: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.primary,
    lineHeight: 20,
  },
  chevron: {
    fontSize: 22,
    color: COLORS.secondary,
    lineHeight: 24,
    width: 16,
    textAlign: "center",
  },
  answerText: {
    fontFamily: FONTS.body,
    fontSize: 13.5,
    color: COLORS.textBody,
    lineHeight: 21,
    paddingBottom: 14,
  },
});

// ─── ContactRow ───────────────────────────────────────────────────────────────
const ContactRow = ({ icon, label, value, onPress, isLast }) => (
  <TouchableOpacity
    onPress={onPress ?? undefined}
    activeOpacity={onPress ? 0.7 : 1}
    style={[contactStyles.row, !isLast && contactStyles.rowDivider]}
  >
    <View style={contactStyles.iconWrap}>
      <Text style={contactStyles.icon}>{icon}</Text>
    </View>
    <View style={contactStyles.texts}>
      <Text style={contactStyles.label}>{label}</Text>
      <Text style={[contactStyles.value, onPress && contactStyles.valueLink]}>
        {value}
      </Text>
    </View>
    {onPress && <Text style={contactStyles.chevron}>›</Text>}
  </TouchableOpacity>
);

const contactStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 14,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(10,29,55,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 17 },
  texts: { flex: 1 },
  label: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  value: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.primary,
  },
  valueLink: { color: COLORS.secondary },
  chevron: {
    fontSize: 20,
    color: COLORS.textMuted,
    lineHeight: 24,
  },
});

// ─── HelpSupportPage ──────────────────────────────────────────────────────────
const HelpSupportPage = () => {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* TopBar replaces PageHeader */}
      <TopBar
        variant="back"
        title="Help & Support"
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* FAQ */}
        <SectionCard title="Frequently Asked Questions">
          <View style={styles.sectionPad}>
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem
                key={item.id}
                question={item.question}
                answer={item.answer}
                isLast={i === FAQ_ITEMS.length - 1}
              />
            ))}
          </View>
        </SectionCard>

        {/* Contact */}
        <SectionCard title="Contact Us">
          <View style={styles.sectionPad}>
            {CONTACT_ITEMS.map((item, i) => (
              <ContactRow
                key={item.id}
                icon={item.icon}
                label={item.label}
                value={item.value}
                onPress={item.onPress}
                isLast={i === CONTACT_ITEMS.length - 1}
              />
            ))}
          </View>
        </SectionCard>

        <Text style={styles.version}>StayEase v2.4.1 · Premium Edition</Text>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  sectionPad: {
    paddingHorizontal: 4,
  },
  version: {
    fontFamily: FONTS.light,
    fontSize: 11.5,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 8,
    letterSpacing: 0.5,
  },
  bottomSpacer: { height: 32 },
});

export default HelpSupportPage;
