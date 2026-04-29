/**
 * oauthService.js
 *
 * Handles Google and Facebook OAuth for both:
 *  - Expo Go (development) → browser-based flow via expo-auth-session
 *  - Production / Dev Build → native SDKs (@react-native-google-signin, react-native-fbsdk-next)
 */

import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { makeRedirectUri, useProxy } from "expo-auth-session";

// ─── Environment detection ────────────────────────────────────────────────────
// appOwnership === "expo"  → running inside Expo Go
// appOwnership === null    → standalone / dev build
const IS_EXPO_GO = Constants.appOwnership === "expo";

// ─── Config ───────────────────────────────────────────────────────────────────
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

// Required by expo-auth-session to close the browser after redirect
WebBrowser.maybeCompleteAuthSession();

// ─── Lazy-load native SDKs (only used in production / dev builds) ─────────────
const getNativeGoogle = () => {
  if (IS_EXPO_GO) return null;
  return require("@react-native-google-signin/google-signin");
};

const getNativeFacebook = () => {
  if (IS_EXPO_GO) return null;
  return require("react-native-fbsdk-next");
};

// ─── Configure native Google SDK once (production only) ──────────────────────
if (!IS_EXPO_GO) {
  const { GoogleSignin } = getNativeGoogle();
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
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
    // Get the appropriate client ID for the platform
    let clientId = GOOGLE_WEB_CLIENT_ID;

    // In Expo Go, we still need to use the correct client ID for the platform
    // The auth proxy handles the redirect automatically
    const redirectUri = AuthSession.makeRedirectUri({
      useProxy: true,
    });

    console.log("Redirect URI:", redirectUri);
    console.log("Using client ID:", clientId);

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

    console.log("Auth result type:", result.type);

    if (result.type === "cancel" || result.type === "dismiss") {
      throw new Error("Google sign-in was cancelled");
    }

    if (result.type !== "success") {
      console.error("Auth result:", result);
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

    console.log("Token received, has idToken:", !!tokenResult.idToken);

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
    console.error("Google sign-in error:", error);
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
// FACEBOOK SIGN-IN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Expo Go path: Facebook OAuth flow using expo-auth-session.
 */
const facebookSignInExpoGo = async () => {
  try {
    const FB_APP_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID;
    if (!FB_APP_ID) {
      throw new Error("Facebook App ID is not configured");
    }

    const redirectUri = AuthSession.makeRedirectUri({
      useProxy: true,
    });

    console.log("Facebook Redirect URI:", redirectUri);

    const discovery = {
      authorizationEndpoint: "https://www.facebook.com/dialog/oauth",
      tokenEndpoint: "https://graph.facebook.com/v12.0/oauth/access_token",
    };

    const request = new AuthSession.AuthRequest({
      clientId: FB_APP_ID,
      scopes: ["public_profile", "email"],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
    });

    const result = await request.promptAsync(discovery);

    if (result.type === "cancel" || result.type === "dismiss") {
      throw new Error("Facebook login was cancelled");
    }

    if (result.type !== "success") {
      console.error("Facebook auth result:", result);
      throw new Error("Facebook sign-in failed");
    }

    // Exchange code for access token
    const tokenResult = await AuthSession.exchangeCodeAsync(
      {
        clientId: FB_APP_ID,
        code: result.params.code,
        redirectUri,
        extraParams: {
          clientSecret: process.env.EXPO_PUBLIC_FACEBOOK_CLIENT_SECRET, // You'll need to add this to .env
        },
      },
      discovery,
    );

    const accessToken = tokenResult.accessToken;

    if (!accessToken) {
      throw new Error("No access token received from Facebook");
    }

    // Fetch basic profile from Graph API
    const profileRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,first_name,last_name,email,picture&access_token=${accessToken}`,
    );
    const profile = await profileRes.json();

    if (profile.error) {
      throw new Error(profile.error.message);
    }

    return {
      provider: "facebook",
      accessToken,
      user: {
        id: profile.id,
        name: profile.name,
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        avatar: profile.picture?.data?.url,
      },
    };
  } catch (error) {
    console.error("Facebook sign-in error:", error);
    throw error;
  }
};

/**
 * Production path: native Facebook SDK.
 */
const facebookSignInNative = async () => {
  const { LoginManager, AccessToken, Profile } = getNativeFacebook();
  try {
    const result = await LoginManager.logInWithPermissions([
      "public_profile",
      "email",
    ]);

    if (result.isCancelled) {
      throw new Error("Facebook login was cancelled");
    }

    const data = await AccessToken.getCurrentAccessToken();
    if (!data) throw new Error("Failed to get Facebook access token");

    const profile = await Profile.getCurrentProfile();

    return {
      provider: "facebook",
      accessToken: data.accessToken,
      user: {
        id: profile?.userID,
        name: profile?.name,
        firstName: profile?.firstName,
        lastName: profile?.lastName,
        avatar: profile?.imageURL,
        email: profile?.email,
      },
    };
  } catch (error) {
    console.error("Facebook native sign-in error:", error);
    throw error;
  }
};

export const facebookSignIn = IS_EXPO_GO
  ? facebookSignInExpoGo
  : facebookSignInNative;

// ─────────────────────────────────────────────────────────────────────────────
// SIGN-OUT
// ─────────────────────────────────────────────────────────────────────────────

export const googleSignOut = async () => {
  if (IS_EXPO_GO) {
    // In Expo Go, we can clear any stored session data
    try {
      await WebBrowser.dismissBrowser();
    } catch (error) {
      console.error("Error dismissing browser:", error);
    }
    return;
  }

  try {
    const { GoogleSignin } = getNativeGoogle();
    await GoogleSignin.signOut();
  } catch (error) {
    console.error("Google sign-out error:", error);
  }
};

export const facebookSignOut = async () => {
  if (IS_EXPO_GO) return;

  try {
    const { LoginManager } = getNativeFacebook();
    await LoginManager.logOut();
  } catch (error) {
    console.error("Facebook sign-out error:", error);
  }
};
