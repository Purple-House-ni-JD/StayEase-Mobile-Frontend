import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS } from "../constants/colors";
import { useAuth } from "@/context/AuthContext";
import { extractErrorMessage } from "@/lib/errorUtils";

// ─── Animated Input Field ─────────────────────────────────────────────────────
const InputField = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  icon,
  rightAction,
}) => {
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () =>
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  const handleBlur = () =>
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.inputBorder, COLORS.inputBorderFocus],
  });

  return (
    <View style={styles.fieldWrapper}>
      <View style={styles.fieldLabelRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {rightAction}
      </View>
      <Animated.View style={[styles.inputContainer, { borderColor }]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {icon && <Text style={styles.inputIcon}>{icon}</Text>}
      </Animated.View>
    </View>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const LoginPage = () => {
  const router = useRouter();
  const { login, googleSignIn, facebookSignIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animations
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const cardSlide = useRef(new Animated.Value(60)).current;
  const cardFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(headerSlide, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(cardFade, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(cardSlide, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [cardFade, cardSlide, headerFade, headerSlide]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email.trim(), password);
      router.replace("pages/HomePage");
    } catch (error) {
      Alert.alert("Login failed", extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgot = () => {
    // TODO: router.push("/pages/ForgotPasswordPage");
  };

  const handleSignUp = () => {
    router.push("pages/RegisterPage");
  };

  const handleGoogle = async () => {
    try {
      setIsSubmitting(true);
      await googleSignIn();
      router.replace("pages/HomePage");
    } catch (error) {
      Alert.alert("Google sign-in failed", extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFacebook = async () => {
    try {
      setIsSubmitting(true);
      await facebookSignIn();
      router.replace("pages/HomePage");
    } catch (error) {
      Alert.alert("Facebook sign-in failed", extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* ── Dark Hero Header ── */}
      <View style={styles.hero}>
        <SafeAreaView edges={["top"]}>
          <Animated.View
            style={[
              styles.heroContent,
              { opacity: headerFade, transform: [{ translateY: headerSlide }] },
            ]}
          >
            <Text style={styles.brandName}>STAYEASE</Text>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.tagline}>THE ART OF LUXURY LIVING</Text>
          </Animated.View>
        </SafeAreaView>
      </View>

      {/* ── White Card ── */}
      <KeyboardAvoidingView
        style={styles.cardWrapper}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Animated.View
          style={[
            styles.card,
            { opacity: cardFade, transform: [{ translateY: cardSlide }] },
          ]}
        >
          {/* Email */}
          <InputField
            label="EMAIL ADDRESS"
            placeholder="name@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            icon="✉️"
          />

          {/* Password */}
          <InputField
            label="PASSWORD"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon="🔒"
            rightAction={
              <TouchableOpacity onPress={handleForgot} activeOpacity={0.7}>
                <Text style={styles.forgotText}>FORGOT?</Text>
              </TouchableOpacity>
            }
          />

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            activeOpacity={0.88}
            disabled={isSubmitting}
          >
            <Text style={styles.loginBtnText}>
              {isSubmitting ? "Signing in..." : "Log In"}
            </Text>
            <Text style={styles.loginBtnArrow}> →</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>OR CONTINUE WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialRow}>
            {/* Google */}
            <TouchableOpacity
              style={styles.socialBtn}
              onPress={handleGoogle}
              activeOpacity={0.85}
            >
              <View style={styles.googleIcon}>
                <Text style={styles.googleG}>G</Text>
              </View>
              <Text style={styles.socialBtnText}>Google</Text>
            </TouchableOpacity>

            {/* Facebook */}
            <TouchableOpacity
              style={styles.socialBtn}
              onPress={handleFacebook}
              activeOpacity={0.85}
            >
              <View style={styles.facebookIcon}>
                <Text style={styles.facebookF}>f</Text>
              </View>
              <Text style={styles.socialBtnText}>Facebook</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signUpRow}>
            <Text style={styles.signUpPrompt}>
              Don&apos;t have an account?{" "}
            </Text>
            <TouchableOpacity onPress={handleSignUp} activeOpacity={0.7}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ── Hero ──
  hero: {
    backgroundColor: COLORS.primary,
    paddingBottom: 60,
  },
  heroContent: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 10,
    gap: 8,
  },
  brandName: {
    fontFamily: FONTS.label,
    fontSize: 15,
    color: COLORS.secondary,
    letterSpacing: 4,
  },
  welcomeText: {
    fontFamily: FONTS.headlineLight,
    fontSize: 26,
    color: COLORS.neutral,
    letterSpacing: 0.3,
  },
  tagline: {
    fontFamily: FONTS.label,
    fontSize: 10.5,
    color: COLORS.secondary,
    letterSpacing: 2.5,
  },

  // ── Card ──
  cardWrapper: {
    flex: 1,
    marginTop: -36,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.neutral,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },

  // ── Input ──
  fieldWrapper: {
    marginBottom: 18,
  },
  fieldLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },
  fieldLabel: {
    fontFamily: FONTS.label,
    fontSize: 10.5,
    color: COLORS.textLabel,
    letterSpacing: 1.2,
  },
  forgotText: {
    fontFamily: FONTS.label,
    fontSize: 10.5,
    color: COLORS.secondary,
    letterSpacing: 1,
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
    opacity: 0.45,
  },

  // ── Login Button ──
  loginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 50,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    marginBottom: 28,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  loginBtnText: {
    fontFamily: FONTS.label,
    fontSize: 15.5,
    color: COLORS.neutral,
    letterSpacing: 0.3,
  },
  loginBtnArrow: {
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
    gap: 12,
    marginBottom: 28,
  },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    paddingVertical: 13,
    backgroundColor: COLORS.neutral,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  socialBtnText: {
    fontFamily: FONTS.label,
    fontSize: 13.5,
    color: COLORS.textBody,
  },
  googleIcon: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  googleG: {
    fontFamily: FONTS.label,
    fontSize: 16,
    color: "#4285F4",
  },
  facebookIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#1877F2",
    alignItems: "center",
    justifyContent: "center",
  },
  facebookF: {
    fontFamily: FONTS.label,
    fontSize: 13,
    color: COLORS.neutral,
    lineHeight: 18,
  },

  // ── Sign Up ──
  signUpRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signUpPrompt: {
    fontFamily: FONTS.body,
    fontSize: 13.5,
    color: COLORS.textBody,
  },
  signUpLink: {
    fontFamily: FONTS.label,
    fontSize: 13.5,
    color: COLORS.secondary,
  },
});

export default LoginPage;
