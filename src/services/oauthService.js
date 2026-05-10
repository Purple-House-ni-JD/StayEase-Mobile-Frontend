/**
 * oauthService.js
 *
 * Handles Google OAuth for both:
 *  - Expo Go (development) → browser-based flow via expo-auth-session
 *  - Production / Dev Build → native SDKs (@react-native-google-signin)
 */

import { Platform } from "react-native";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { makeRedirectUri } from "expo-auth-session";

// ─── Environment detection ────────────────────────────────────────────────────
// appOwnership === "expo"  → running inside Expo Go
// appOwnership === null    → standalone / dev build
const IS_EXPO_GO = Constants.appOwnership === "expo";

// ─── Config ───────────────────────────────────────────────────────────────────
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

const isAndroid = Platform.OS === "android";
const getGoogleClientId = () => {
  if (IS_EXPO_GO) return GOOGLE_WEB_CLIENT_ID;
  if (isAndroid) return GOOGLE_ANDROID_CLIENT_ID || GOOGLE_WEB_CLIENT_ID;
  return GOOGLE_IOS_CLIENT_ID || GOOGLE_WEB_CLIENT_ID;
};

WebBrowser.maybeCompleteAuthSession();

// ─── Lazy-load native SDKs (only used in production / dev builds) ─────────────
const getNativeGoogle = () => {
  if (IS_EXPO_GO) return null;
  return require("@react-native-google-signin/google-signin");
};

// ─── Configure native Google SDK once (production only) ──────────────────────
if (!IS_EXPO_GO) {
  const { GoogleSignin } = getNativeGoogle();
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    offlineAccess: true,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE SIGN-IN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Expo Go path: opens a browser OAuth flow and returns an id_token.
 * Uses the proper redirect URI and client IDs for the platform.
 */
const googleSignInExpoGo = async () => {
  try {
    const clientId = getGoogleClientId();
    const redirectUri = makeRedirectUri({
      useProxy: IS_EXPO_GO,
    });

    const discovery = await AuthSession.fetchDiscoveryAsync(
      "https://accounts.google.com",
    );

    // Create the auth request
    const request = new AuthSession.AuthRequest({
      clientId,
      scopes: ["openid", "profile", "email"],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    });

    // Prompt the user for authentication
    const result = await request.promptAsync(discovery);

    if (result.type === "cancel" || result.type === "dismiss") {
      throw new Error("Google sign-in was cancelled");
    }

    if (result.type !== "success") {
      throw new Error("Google sign-in failed");
    }

    // Exchange the authorization code for tokens
    const tokenResult = await AuthSession.exchangeCodeAsync(
      {
        clientId,
        code: result.params.code,
        redirectUri,
        extraParams: {
          code_verifier: request.codeVerifier,
        },
      },
      discovery,
    );

    if (!tokenResult.idToken) {
      throw new Error("No id_token received from Google");
    }

    return {
      provider: "google",
      idToken: tokenResult.idToken,
      accessToken: tokenResult.accessToken,
      user: null,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Production path: native Google Sign-In SDK.
 */
const googleSignInNative = async () => {
  const { GoogleSignin, statusCodes } = getNativeGoogle();
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    return {
      provider: "google",
      idToken: userInfo.idToken,
      accessToken: userInfo.accessToken,
      user: userInfo.user,
    };
  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new Error("Google sign-in was cancelled");
    } else if (error.code === statusCodes.IN_PROGRESS) {
      throw new Error("Google sign-in is already in progress");
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error("Google Play Services not available");
    }
    throw error;
  }
};

export const googleSignIn = IS_EXPO_GO
  ? googleSignInExpoGo
  : googleSignInNative;

// ─────────────────────────────────────────────────────────────────────────────
// SIGN-OUT
// ─────────────────────────────────────────────────────────────────────────────

export const googleSignOut = async () => {
  if (IS_EXPO_GO) {
    // In Expo Go, we can clear any stored session data
    try {
      await WebBrowser.dismissBrowser();
    } catch (error) {
      // ignore dismiss browser failures in Expo Go
    }
    return;
  }

  try {
    const { GoogleSignin } = getNativeGoogle();
    await GoogleSignin.signOut();
  } catch (error) {
    // sign-out failure handled silently
  }
};
