"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

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

  return (
    <main className="min-h-screen bg-[#f9f9f9] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#008080]">Template Selection</p>
        <h1 className="mt-2 text-3xl font-bold text-[#1a1a1a]">You selected: {template ?? "No template selected"}</h1>
        <p className="mt-3 text-sm text-[#666666]">
          We saved your template choice. Continue to account creation to finish setup.
        </p>

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
        </div>
      </div>
    </main>
  );
}

function StorefrontCreateTemplateFallback() {
  return (
    <main className="min-h-screen bg-[#f9f9f9] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#008080]">Template Selection</p>
        <h1 className="mt-2 text-3xl font-bold text-[#1a1a1a]">Loading template...</h1>
      </div>
    </main>
  );
}
