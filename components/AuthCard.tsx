import type { ReactNode } from "react";
import Link from "next/link";

type AuthCardProps = {
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkLabel: string;
  footerLinkHref: string;
  children: ReactNode;
};

export function AuthCard({
  title,
  subtitle,
  footerText,
  footerLinkLabel,
  footerLinkHref,
  children
}: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <div className="card w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
        <div className="mt-6 space-y-4">{children}</div>
        <p className="mt-6 text-center text-sm text-slate-600">
          {footerText}{" "}
          <Link href={footerLinkHref} className="font-semibold text-brand-600 hover:text-brand-700">
            {footerLinkLabel}
          </Link>
        </p>
      </div>
    </main>
  );
}
