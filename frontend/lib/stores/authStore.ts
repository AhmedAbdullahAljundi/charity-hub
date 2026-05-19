"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginApi, logoutApi, meApi, refreshApi } from "@/lib/api/auth-api";
import { setAuthTokens, clearAuthTokens, REFRESH_KEY } from "@/lib/api/client";
import type { ApiUser } from "@/lib/types/api";

interface AuthState {
  user: ApiUser | null;
  token: string | null;
  refreshToken: string | null;
  preferredLocale: "ar" | "en";
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokenAction: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setPreferredLocale: (locale: "ar" | "en") => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      preferredLocale: "ar",
      isAuthenticated: false,

      login: async (email, password) => {
        const data = await loginApi(email, password);
        setAuthTokens(data.accessToken, data.refreshToken);
        set({
          user: data.user,
          token: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
          preferredLocale: (data.user.preferredLocale as "ar" | "en") || "ar",
        });
      },

      logout: async () => {
        const rt = get().refreshToken || localStorage.getItem(REFRESH_KEY);
        try {
          if (rt) await logoutApi(rt);
        } catch {
          /* ignore */
        }
        clearAuthTokens();
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
      },

      refreshTokenAction: async () => {
        const rt = get().refreshToken || localStorage.getItem(REFRESH_KEY);
        if (!rt) throw new Error("No refresh token");
        const data = await refreshApi(rt);
        setAuthTokens(data.accessToken, data.refreshToken);
        set({
          token: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
          isAuthenticated: true,
        });
      },

      fetchMe: async () => {
        const user = await meApi();
        set({ user, isAuthenticated: true });
      },

      setPreferredLocale: (locale) => set({ preferredLocale: locale }),
    }),
    { name: "charityhub-auth-v2" }
  )
);
