import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authEventEmitter } from "../lib/apiClient";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "../lib/tokenStorage";
import * as authService from "../services/authService";
import { googleSignIn, googleSignOut } from "../services/oauthService";
import { googleOAuthLogin } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          const me = await authService.getMe();
          setUser(me);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
    authEventEmitter.on("logout", () => {
      setUser(null);
    });
  }, []);

  const updateUser = (updatedFields) => {
    setUser((prev) => ({ ...prev, ...updatedFields }));
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login: async (email, password) => {
        const data = await authService.login(email, password);
        await saveTokens(data.access, data.refresh);
        setUser(data.user);
        return data.user;
      },
      register: async (payload) => {
        const data = await authService.register(payload);
        await saveTokens(data.access, data.refresh);
        setUser(data.user);
        return data.user;
      },
      googleSignIn: async () => {
        try {
          const oauthData = await googleSignIn();
          // Send Google id_token to backend
          const data = await googleOAuthLogin(oauthData.idToken);
          await saveTokens(data.access, data.refresh);
          setUser(data.user);
          return data.user;
        } catch (error) {
          throw error;
        }
      },
      logout: async () => {
        try {
          const refresh = await getRefreshToken();
          if (refresh) {
            await authService.logout(refresh);
          }
          // Sign out from OAuth providers
          await googleSignOut();
        } catch {
          // Ignore API logout failures and clear local state.
        } finally {
          await clearTokens();
          setUser(null);
        }
      },
      updateUser,
    }),
    [isLoading, user],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
