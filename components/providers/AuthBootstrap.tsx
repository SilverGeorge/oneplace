"use client";

import { useEffect } from "react";
import { apiRequest } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";

type MeResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    bio?: string | null;
    avatarUrl?: string | null;
  };
};

export function AuthBootstrap(): null {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setHydrated = useAuthStore((state) => state.setHydrated);

  useEffect(() => {
    const init = async () => {
      try {
        const response = await apiRequest<MeResponse>("/api/auth/me", { method: "GET" });
        setAuth({
          token: "",
          user: response.data.user
        });
      } catch {
        // Ignore: no authenticated session in cookie.
      } finally {
        setHydrated(true);
      }
    };

    void init();
  }, [setAuth, setHydrated]);

  return null;
}
