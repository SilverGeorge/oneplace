"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  MdDashboard,
  MdStore,
  MdInventory2,
  MdReceiptLong,
  MdPeople,
  MdLanguage,
  MdRequestQuote,
  MdCardMembership,
  MdCollectionsBookmark,
  MdHelp,
  MdSettings,
  MdClose
} from "react-icons/md";

type MenuItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const menuItems: MenuItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: MdDashboard },
  { label: "Store section", href: "/dashboard/store", icon: MdStore },
  { label: "Products", href: "/dashboard/products", icon: MdInventory2 },
  { label: "Order List", href: "/dashboard/orders", icon: MdReceiptLong },
  { label: "Customer List", href: "/dashboard/customers", icon: MdPeople },
  { label: "Webstore", href: "/dashboard/webstore", icon: MdLanguage },
  { label: "Invoicing", href: "/dashboard/invoicing", icon: MdRequestQuote },
  { label: "Templates", href: "/dashboard/templates", icon: MdCollectionsBookmark },
  { label: "Subscription", href: "/dashboard/subscription", icon: MdCardMembership },
  { label: "Help", href: "/dashboard/help", icon: MdHelp },
  { label: "Settings", href: "/dashboard/settings", icon: MdSettings }
];

export function withPreviewParam(href: string, isPreviewMode: boolean): string {
  if (!isPreviewMode) return href;
  return href.includes("?") ? `${href}&preview=1` : `${href}?preview=1`;
}

export function SidebarMenu({
  pathname,
  isPreviewMode,
  mobileOpen,
  onCloseMobile
}: {
  pathname: string;
  isPreviewMode: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/40 transition md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-[220px] border-r border-[#e0e0e0] bg-[#f9f9f9] p-4 transition-transform duration-300 md:sticky md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          type="button"
          onClick={onCloseMobile}
          className="mb-4 rounded p-1 text-[#666] hover:bg-white md:hidden"
          aria-label="Close sidebar"
        >
          <MdClose size={20} />
        </button>

        <nav aria-label="Sidebar navigation">
          <ul className="space-y-2 text-sm">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={withPreviewParam(item.href, isPreviewMode)}
                    className={cn(
                      "flex items-center gap-2 rounded-l-xl border-l-4 border-transparent px-3 py-2 text-[#333] transition-all duration-200 hover:bg-[#f0fffe]",
                      isActive && "border-[#008080] bg-[#f8fffe] text-[#008080]"
                    )}
                  >
                    <Icon size={24} className="text-[#008080]" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
