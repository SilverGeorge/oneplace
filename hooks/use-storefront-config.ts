"use client";

import { useState } from "react";
import {
  STOREFRONT_TEMPLATE_CONFIG_KEY,
  StorefrontTemplateConfig,
  getTemplateById
} from "@/lib/storefront-templates";

export type StorefrontResolvedConfig = {
  templateName: string;
  colors: {
    primary: string;
    accent: string;
    background: string;
    text: string;
  };
  fontFamily: "Plus Jakarta Sans" | "Inter" | "Poppins" | "Montserrat";
  layout: "grid" | "sidebar" | "full";
  storeName: string;
  storeDescription: string;
  navigationItems: string[];
  footerText: string;
  footerLinks: string[];
  coverImage?: string;
  logoImage?: string;
  customProducts: NonNullable<StorefrontTemplateConfig["customProducts"]>;
};

const fallback: StorefrontResolvedConfig = {
  templateName: "Default",
  colors: {
    primary: "#008080",
    accent: "#ffc300",
    background: "#f8fffe",
    text: "#1a1a1a"
  },
  fontFamily: "Plus Jakarta Sans",
  layout: "grid",
  storeName: "Jon Smith Electronics",
  storeDescription: "Premium electronics and accessories with fast delivery.",
  navigationItems: ["All Products", "New Arrivals", "Best Sellers", "About"],
  footerText: "Built with One Place",
  footerLinks: ["Privacy", "Terms", "Support"],
  customProducts: []
};

export function useStorefrontConfig(): StorefrontResolvedConfig {
  const [config] = useState<StorefrontResolvedConfig>(() => {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = window.localStorage.getItem(STOREFRONT_TEMPLATE_CONFIG_KEY);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw) as Partial<StorefrontTemplateConfig>;
      const template = parsed.templateId ? getTemplateById(parsed.templateId) : undefined;
      const palette = parsed.colors ?? template?.palette ?? fallback.colors;
      return {
        templateName: parsed.templateName ?? template?.name ?? fallback.templateName,
        colors: {
          primary: palette.primary ?? fallback.colors.primary,
          accent: palette.accent ?? fallback.colors.accent,
          background: palette.background ?? fallback.colors.background,
          text: palette.text ?? fallback.colors.text
        },
        fontFamily: parsed.fontFamily ?? fallback.fontFamily,
        layout: parsed.layout ?? fallback.layout,
        storeName: parsed.storeName ?? fallback.storeName,
        storeDescription: parsed.storeDescription ?? fallback.storeDescription,
        navigationItems: parsed.navigationItems?.length
          ? parsed.navigationItems
          : fallback.navigationItems,
        footerText: parsed.footerText ?? fallback.footerText,
        footerLinks: parsed.footerLinks?.length ? parsed.footerLinks : fallback.footerLinks,
        coverImage: parsed.coverImage,
        logoImage: parsed.logoImage,
        customProducts: parsed.customProducts ?? []
      };
    } catch {
      return fallback;
    }
  });

  return config;
}
