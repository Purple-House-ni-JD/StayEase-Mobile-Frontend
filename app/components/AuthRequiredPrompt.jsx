import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import TopBar from "./TopBar";

const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  neutral: "#FFFFFF",
  background: "#F5F3EF",
  textMuted: "#9A9690",
  textBody: "#3A3530",
};

const FONTS = {
  headline: "NotoSerif-Bold",
  body: "PlusJakartaSans-Regular",
  label: "PlusJakartaSans-Bold",
};

const AuthRequiredPrompt = ({ featureName }) => {
  const router = useRouter();

  const handleLogin = () => {
    router.push("pages/LoginPage");
  };

  const handleRegister = () => {
    router.push("pages/RegisterPage");
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <TopBar />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>

        <Text style={styles.title}>Authentication Required</Text>
        
        <Text style={styles.message}>
          Please log in or create an account to access {featureName}.
        </Text>

        <Text style={styles.submessage}>
          Join thousands of guests who enjoy personalized booking experiences, 
          exclusive deals, and seamless reservation management.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleLogin}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryButtonText}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleRegister}
            activeOpacity={0.88}
          >
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Continue as Guest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(10, 29, 55, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  lockIcon: {
    fontSize: 36,
  },
  title: {
    fontFamily: FONTS.headline,
    fontSize: 28,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 34,
  },
  message: {
    fontFamily: FONTS.body,
    fontSize: 16,
    color: COLORS.textBody,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 24,
  },
  submessage: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 50,
    paddingVertical: 18,
    paddingHorizontal: 28,
    alignItems: "center",
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  primaryButtonText: {
    fontFamily: FONTS.label,
    fontSize: 16,
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
  },
  secondaryButtonText: {
    fontFamily: FONTS.label,
    fontSize: 16,
    color: COLORS.secondary,
    letterSpacing: 0.3,
  },
  backButton: {
    paddingVertical: 12,
  },
  backButtonText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textMuted,
    letterSpacing: 0.2,
  },
});

export default AuthRequiredPrompt;
