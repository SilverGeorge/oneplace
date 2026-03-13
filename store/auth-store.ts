"use client";

import { create } from "zustand";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  bio?: string | null;
  avatarUrl?: string | null;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  isHydrated: boolean;
  setAuth: (payload: { token: string; user: AuthUser }) => void;
  updateUser: (user: Partial<AuthUser>) => void;
  clearAuth: () => void;
  setHydrated: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isHydrated: false,
  setAuth: ({ token, user }) => set({ token, user }),
  updateUser: (user) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...user } : null
    })),
  clearAuth: () => set({ token: null, user: null }),
  setHydrated: (value) => set({ isHydrated: value })
}));
