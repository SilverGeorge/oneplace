"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type NavItem = {
  label: string;
  href: string;
};

const centerLinks: NavItem[] = [
  { label: "Storefront", href: "/" },
  { label: "Digital Service", href: "/digital-service" },
  { label: "Businesses", href: "/businesses" }
];

const rightLinks: NavItem[] = [
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" }
];

const mobileLinks = [...centerLinks, ...rightLinks];

function NavLink({
  item,
  pathname,
  onClick
}: {
  item: NavItem;
  pathname: string;
  onClick?: () => void;
}) {
  const isStorefront = item.label === "Storefront";

  const isActive = isStorefront
    ? pathname === "/" || pathname.startsWith("/storefront")
    : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group relative py-2 text-sm font-medium transition-colors duration-300",
        isActive ? "text-primary" : "text-slate-700 hover:text-primary"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {item.label}
      <span
        className={cn(
          "absolute -bottom-0.5 left-0 h-0.5 w-full origin-left bg-[#008080] transition-transform duration-300",
          isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        )}
      />
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const currentPath = pathname ?? "";

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="container-main grid h-16 grid-cols-[1fr_auto] items-center md:h-20 md:grid-cols-[auto_1fr_auto]">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 items-center rounded-md bg-[#008080] px-2 text-xs font-bold text-white md:h-10">
              ONEPLACE
            </div>
          </Link>

          <nav className="hidden items-center justify-center gap-8 md:flex">
            {centerLinks.map((item) => (
              <NavLink key={item.href} item={item} pathname={currentPath} />
            ))}
          </nav>

          <nav className="hidden items-center gap-6 md:flex">
            {rightLinks.map((item) => (
              <NavLink key={item.href} item={item} pathname={currentPath} />
            ))}
          </nav>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition-colors duration-200 hover:bg-slate-100 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <span className="space-y-1.5">
              <span className="block h-0.5 w-5 bg-slate-700" />
              <span className="block h-0.5 w-5 bg-slate-700" />
              <span className="block h-0.5 w-5 bg-slate-700" />
            </span>
          </button>
        </div>
      </header>

      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/40 transition-opacity duration-300 md:hidden",
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile menu */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-72 border-r border-slate-200 bg-white p-5 shadow-xl transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          <div className="flex h-8 items-center rounded-md bg-[#008080] px-2 text-xs font-bold text-white">
            Oneplace
          </div>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition-colors duration-200 hover:bg-slate-100"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          {mobileLinks.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pathname={currentPath}
              onClick={() => setMobileOpen(false)}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}

export { Navbar };
