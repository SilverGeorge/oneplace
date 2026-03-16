"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  STOREFRONT_TEMPLATE_CONFIG_KEY,
  type StorefrontTemplateConfig
} from "@/lib/storefront-templates";

export default function StorefrontCreateTemplatePage() {
  return (
    <Suspense fallback={<StorefrontCreateTemplateFallback />}>
      <StorefrontCreateTemplateContent />
    </Suspense>
  );
}

function StorefrontCreateTemplateContent() {
  const searchParams = useSearchParams();
  const template = searchParams?.get("template");
  const [savedConfig] = useState<StorefrontTemplateConfig | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(STOREFRONT_TEMPLATE_CONFIG_KEY);
      return raw ? (JSON.parse(raw) as StorefrontTemplateConfig) : null;
    } catch {
      return null;
    }
  });

  return (
    <main className="min-h-screen bg-[#f9f9f9] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#008080]">
          Template Selection
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[#1a1a1a]">
          You selected: {template ?? "No template selected"}
        </h1>
        <p className="mt-3 text-sm text-[#666666]">
          We saved your template choice. Continue to account creation to finish setup.
        </p>
        {savedConfig ? (
          <div className="mt-4 rounded-lg border border-[#e0e0e0] bg-[#f8fffe] p-3 text-sm text-[#333]">
            <p className="font-semibold">Selected style: {savedConfig.templateName}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-[#d9d9d9] px-2 py-1 text-xs">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: savedConfig.colors.primary }}
                />
                Primary
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#d9d9d9] px-2 py-1 text-xs">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: savedConfig.colors.accent }}
                />
                Accent
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#d9d9d9] px-2 py-1 text-xs">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: savedConfig.colors.background }}
                />
                Background
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#d9d9d9] px-2 py-1 text-xs">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: savedConfig.colors.text }}
                />
                Text
              </span>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/storefront/create-account${template ? `?template=${template}` : ""}`}
            className="inline-flex items-center justify-center rounded-lg bg-[#008080] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#0a6d6d]"
          >
            Continue to Create Account
          </Link>
          <Link
            href="/templates"
            className="inline-flex items-center justify-center rounded-lg border border-[#008080] px-5 py-3 text-sm font-semibold text-[#008080] transition duration-300 hover:bg-[#f0fffe]"
          >
            Back to Templates
          </Link>
          <Link
            href="/store/jon-smith-electronics"
            className="inline-flex items-center justify-center rounded-lg border border-[#1a1a1a] px-5 py-3 text-sm font-semibold text-[#1a1a1a] transition duration-300 hover:bg-[#f5f5f5]"
          >
            Preview Storefront Theme
          </Link>
        </div>
      </div>
    </main>
  );
}

function StorefrontCreateTemplateFallback() {
  return (
    <main className="min-h-screen bg-[#f9f9f9] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#008080]">
          Template Selection
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[#1a1a1a]">Loading template...</h1>
      </div>
    </main>
  );
}
