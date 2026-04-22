import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  tertiary: "#E6BE7E",
  neutral: "#FFFFFF",
  background: "#F5F3EF",
  inputBg: "#FFFFFF",
  inputBorder: "#E0DDD8",
  inputBorderFocus: "#C5A059",
  textMuted: "#9A9690",
  textBody: "#3A3530",
  textLabel: "#5A5550",
  danger: "#C0392B",
};

const FONTS = {
  headline: "NotoSerif-Bold",
  headlineReg: "NotoSerif-Regular",
  body: "PlusJakartaSans-Regular",
  bodyLight: "PlusJakartaSans-Light",
  label: "PlusJakartaSans-Bold",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const InputField = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  icon,
}) => {
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.inputBorder, COLORS.inputBorderFocus],
  });

  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Animated.View style={[styles.inputContainer, { borderColor }]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {icon && <Text style={styles.inputIcon}>{icon}</Text>}
      </Animated.View>
    </View>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const RegisterPage = () => {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRegister = () => {
    router.push("/pages/LoginPage");
  };

  const handleBack = () => {
    router.back();
  };

  const handleSignIn = () => {
    router.push("/pages/LoginPage");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Top Bar ── */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.brandName}>STAYEASE</Text>
            <View style={styles.backBtn} />
          </View>

          <Animated.View
            style={[
              styles.formArea,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* ── Heading ── */}
            <View style={styles.headingBlock}>
              <Text style={styles.headline}>Create an Account</Text>
              <Text style={styles.subheadline}>
                Experience a world of luxury and personalized stays.
              </Text>
            </View>

            {/* ── Form Fields ── */}
            <InputField
              label="FIRST NAME"
              placeholder="Enter your first name"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              icon="👤"
            />
            <InputField
              label="LAST NAME"
              placeholder="Enter your last name"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              icon="👤"
            />
            <InputField
              label="EMAIL ADDRESS"
              placeholder="example@stayease.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              icon="✉️"
            />
            <InputField
              label="PASSWORD"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon="🔒"
            />
            <InputField
              label="CONFIRM PASSWORD"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              icon="🔒"
            />

            {/* ── Terms Checkbox ── */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreed(!agreed)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                By creating an account, you agree to our{" "}
                <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>.
              </Text>
            </TouchableOpacity>

            {/* ── CTA Button ── */}
            <TouchableOpacity
              style={[
                styles.registerBtn,
                !agreed && styles.registerBtnDisabled,
              ]}
              onPress={handleRegister}
              activeOpacity={0.88}
              disabled={!agreed}
            >
              <Text style={styles.registerBtnText}>Complete Registration</Text>
              <Text style={styles.registerBtnArrow}> →</Text>
            </TouchableOpacity>

            {/* ── Divider ── */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>OR REGISTER WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* ── Social Buttons ── */}
            <View style={styles.socialRow}>
              {/* Google */}
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
                <Text style={styles.socialIcon}>G</Text>
              </TouchableOpacity>
              {/* Apple / iOS */}
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
                <Text style={styles.socialLabel}>iOS</Text>
              </TouchableOpacity>
            </View>

            {/* ── Sign In Link ── */}
            <View style={styles.signInRow}>
              <Text style={styles.signInPrompt}>Already have an account? </Text>
              <TouchableOpacity onPress={handleSignIn} activeOpacity={0.7}>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ── Top Bar ──
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.background,
  },
  backBtn: {
    width: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 20,
    color: COLORS.primary,
    fontFamily: FONTS.body,
  },
  brandName: {
    fontFamily: FONTS.label,
    fontSize: 15,
    color: COLORS.primary,
    letterSpacing: 3,
  },

  // ── Form Area ──
  formArea: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  // ── Heading ──
  headingBlock: {
    marginBottom: 28,
  },
  headline: {
    fontFamily: FONTS.headlineReg,
    fontSize: 30,
    color: COLORS.primary,
    marginBottom: 8,
    lineHeight: 38,
  },
  subheadline: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textBody,
    lineHeight: 22,
  },

  // ── Input Field ──
  fieldWrapper: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontFamily: FONTS.label,
    fontSize: 10.5,
    color: COLORS.textLabel,
    letterSpacing: 1.2,
    marginBottom: 7,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 52,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.body,
    fontSize: 14.5,
    color: COLORS.textBody,
    paddingVertical: 0,
  },
  inputIcon: {
    fontSize: 15,
    marginLeft: 8,
    opacity: 0.5,
  },

  // ── Terms ──
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.inputBg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  checkmark: {
    color: COLORS.neutral,
    fontSize: 11,
    fontFamily: FONTS.label,
  },
  termsText: {
    flex: 1,
    fontFamily: FONTS.body,
    fontSize: 12.5,
    color: COLORS.textBody,
    lineHeight: 19,
  },
  termsLink: {
    color: COLORS.secondary,
    fontFamily: FONTS.label,
  },

  // ── Register Button ──
  registerBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 50,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  registerBtnDisabled: {
    opacity: 0.5,
  },
  registerBtnText: {
    fontFamily: FONTS.label,
    fontSize: 15.5,
    color: COLORS.neutral,
    letterSpacing: 0.3,
  },
  registerBtnArrow: {
    fontFamily: FONTS.label,
    fontSize: 17,
    color: COLORS.neutral,
  },

  // ── Divider ──
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.inputBorder,
  },
  dividerLabel: {
    fontFamily: FONTS.label,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 1.2,
  },

  // ── Social ──
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 28,
  },
  socialBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.inputBg,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  socialIcon: {
    fontFamily: FONTS.label,
    fontSize: 18,
    color: COLORS.primary,
  },
  socialLabel: {
    fontFamily: FONTS.label,
    fontSize: 13,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  // ── Sign In ──
  signInRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signInPrompt: {
    fontFamily: FONTS.body,
    fontSize: 13.5,
    color: COLORS.textBody,
  },
  signInLink: {
    fontFamily: FONTS.label,
    fontSize: 13.5,
    color: COLORS.secondary,
  },
});

export default RegisterPage;
