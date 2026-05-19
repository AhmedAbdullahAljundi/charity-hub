"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ─────────── Auth Store ─────────── */
interface AuthState {
  user: any;
  token: any;
  isAuthenticated: boolean;
  login: (user: any, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("charityhub_token", token);
        }
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("charityhub_token");
        }
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { name: "charityhub-auth" }
  )
);
