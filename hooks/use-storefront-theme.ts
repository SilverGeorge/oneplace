"use client";

import { useState } from "react";
import {
  STOREFRONT_TEMPLATE_CONFIG_KEY,
  StorefrontTemplateConfig,
  getTemplateById
} from "@/lib/storefront-templates";

type StorefrontThemeState = {
  templateName: string;
  colors: {
    primary: string;
    accent: string;
    background: string;
    text: string;
  };
};

const fallbackTheme: StorefrontThemeState = {
  templateName: "Default",
  colors: {
    primary: "#008080",
    accent: "#ffc300",
    background: "#f8fffe",
    text: "#1a1a1a"
  }
};

export function useStorefrontTheme(): StorefrontThemeState {
  const [theme] = useState<StorefrontThemeState>(() => {
    if (typeof window === "undefined") return fallbackTheme;
    try {
      const raw = window.localStorage.getItem(STOREFRONT_TEMPLATE_CONFIG_KEY);
      if (!raw) return fallbackTheme;
      const parsed = JSON.parse(raw) as Partial<StorefrontTemplateConfig>;
      const selected = parsed.templateId ? getTemplateById(parsed.templateId) : undefined;
      const palette = parsed.colors ?? selected?.palette ?? fallbackTheme.colors;
      return {
        templateName: parsed.templateName ?? selected?.name ?? fallbackTheme.templateName,
        colors: {
          primary: palette.primary ?? fallbackTheme.colors.primary,
          accent: palette.accent ?? fallbackTheme.colors.accent,
          background: palette.background ?? fallbackTheme.colors.background,
          text: palette.text ?? fallbackTheme.colors.text
        }
      };
    } catch {
      return fallbackTheme;
    }
  });

  return theme;
}
