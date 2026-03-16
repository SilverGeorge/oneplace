"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  MdDashboard,
  MdStore,
  MdInventory2,
  MdReceiptLong,
  MdPeople,
  MdLanguage,
  MdRequestQuote,
  MdCollectionsBookmark,
  MdCardMembership,
  MdHelp,
  MdSettings,
  MdMenu,
  MdNotificationsNone,
  MdSearch,
  MdMoreVert,
  MdShoppingCart,
  MdTrendingUp,
  MdEdit,
  MdDelete,
  MdClose,
  MdWarningAmber,
  MdInfoOutline,
  MdOpenInNew
} from "react-icons/md";
import { apiRequest } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { usePreviewMode } from "@/hooks/use-preview-mode";

type Kpi = {
  label: string;
  value: string;
  trend: string;
  trendDirection: "up" | "down";
  icon: "users" | "orders" | "vendors" | "earnings";
};

type RevenuePoint = {
  month: string;
  earnings: number;
  invested: number;
  expenses: number;
};

type OrderRow = {
  id: string;
  customer: string;
  item: string;
  amount: string;
  paymentMethod: string;
  status: "Completed" | "Pending" | "Cancelled";
  orderedAt: string;
  shippingAddress?: string;
  notes?: string;
  trackingNumber?: string;
};

type Activity = {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  userName: string;
  avatarUrl: string;
};

type ProfileResponse = {
  user: {
    name: string;
    avatarUrl?: string | null;
  };
};

const menuItems = [
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

const piePalette = ["#008080", "#6366f1", "#f59e0b", "#27ae60"];

const salesByCategory = [
  { label: "Electronics", value: 42 },
  { label: "Fashion", value: 28 },
  { label: "Groceries", value: 18 },
  { label: "Home", value: 12 }
];

export default function DashboardPage() {
  const pathname = usePathname() ?? "/dashboard";
  const isPreviewMode = usePreviewMode();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [userName, setUserName] = useState("Smith");
  const [avatarUrl, setAvatarUrl] = useState("https://i.pravatar.cc/80?img=12");
  const [isLoading, setIsLoading] = useState(true);
  const [dismissWelcome, setDismissWelcome] = useState(false);
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(null);
  const [editingOrder, setEditingOrder] = useState<OrderRow | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<OrderRow | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [kpiRes, revenueRes, ordersRes, activityRes] = await Promise.all([
          apiRequest<{ items: Kpi[] }>("/api/dashboard/kpi"),
          apiRequest<{ points: RevenuePoint[] }>("/api/dashboard/revenue"),
          apiRequest<{ items: OrderRow[] }>("/api/dashboard/orders"),
          apiRequest<{ items: Activity[] }>("/api/dashboard/activity")
        ]);
        setKpis(kpiRes.data.items);
        setRevenue(revenueRes.data.points);
        setOrders(ordersRes.data.items);
        setActivity(activityRes.data.items);
      } catch {
        // Keep dashboard stable even if any endpoint fails.
      } finally {
        setIsLoading(false);
      }

      try {
        const profileRes = await apiRequest<ProfileResponse>("/api/user/profile");
        const firstName = profileRes.data.user.name?.split(" ")[0];
        if (firstName) setUserName(firstName);
        if (profileRes.data.user.avatarUrl) setAvatarUrl(profileRes.data.user.avatarUrl);
      } catch {
        // Fallback to default greeting/avatar.
      }
    }

    void loadDashboard();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setEditingOrder(null);
        setDeletingOrder(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filteredOrders = useMemo(() => {
    if (!searchValue.trim()) return orders;
    const value = searchValue.toLowerCase();
    return orders.filter(
      (item) =>
        item.customer.toLowerCase().includes(value) ||
        item.item.toLowerCase().includes(value) ||
        item.status.toLowerCase().includes(value)
    );
  }, [orders, searchValue]);

  const chartGeometry = useMemo(() => {
    const width = 760;
    const height = 260;
    const padX = 40;
    const padY = 28;
    const chartWidth = width - padX * 2;
    const chartHeight = height - padY * 2;
    const maxValue = Math.max(
      ...revenue.flatMap((item) => [item.earnings, item.invested, item.expenses]),
      1
    );

    function points(values: number[]) {
      return values
        .map((value, index) => {
          const x = padX + (chartWidth / Math.max(values.length - 1, 1)) * index;
          const y = padY + chartHeight - (value / maxValue) * chartHeight;
          return `${x},${y}`;
        })
        .join(" ");
    }

    return {
      width,
      height,
      points,
      padX,
      padY,
      chartHeight
    };
  }, [revenue]);

  const pieArcs = useMemo(() => {
    const total = salesByCategory.reduce((sum, item) => sum + item.value, 0);
    return salesByCategory.reduce<
      Array<{ label: string; value: number; color: string; d: string }>
    >((acc, item, index) => {
      const start =
        index === 0
          ? -Math.PI / 2
          : acc
              .slice(0, index)
              .reduce((sum, prev) => sum + (prev.value / total) * Math.PI * 2, -Math.PI / 2);
      const angle = (item.value / total) * Math.PI * 2;
      const end = start + angle;
      const x1 = 50 + 42 * Math.cos(start);
      const y1 = 50 + 42 * Math.sin(start);
      const x2 = 50 + 42 * Math.cos(end);
      const y2 = 50 + 42 * Math.sin(end);
      const largeArc = angle > Math.PI ? 1 : 0;

      return [
        ...acc,
        {
          ...item,
          color: piePalette[index % piePalette.length],
          d: `M 50 50 L ${x1} ${y1} A 42 42 0 ${largeArc} 1 ${x2} ${y2} Z`
        }
      ];
    }, []);
  }, []);

  function withPreview(href: string): string {
    if (!isPreviewMode) return href;
    return href.includes("?") ? `${href}&preview=1` : `${href}?preview=1`;
  }

  function openEdit(order: OrderRow) {
    setEditingOrder({ ...order });
  }

  function saveEdit() {
    if (!editingOrder) return;
    setOrders((prev) => prev.map((order) => (order.id === editingOrder.id ? editingOrder : order)));
    setEditingOrder(null);
    setToast({ type: "success", message: "✅ Order updated successfully" });
  }

  function confirmDelete() {
    if (!deletingOrder) return;
    setOrders((prev) => prev.filter((order) => order.id !== deletingOrder.id));
    setDeletingOrder(null);
    setToast({ type: "warning", message: "Order deleted successfully" });
  }

  function openStoreWebsite() {
    const vendorUsername = "jon-smith-electronics";
    window.open(withPreview(`/store/${vendorUsername}`), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="animate-form-fade min-h-screen bg-white text-[#1a1a1a]">
      <div className="flex">
        <DashboardSidebar
          pathname={pathname}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          withPreview={withPreview}
        />

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-[#e0e0e0] bg-white px-4 py-4 sm:px-6">
            <div className="flex flex-wrap items-center gap-3 lg:gap-5">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[#008080] hover:bg-[#f0fffe] lg:hidden"
                aria-label="Open dashboard menu"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <MdMenu size={24} />
              </button>

              <div className="min-w-[240px] flex-1">
                <p className="text-[18px] font-semibold text-[#333]">Good morning, {userName}!</p>
                <div className="mt-2 flex h-11 w-full max-w-[300px] items-center rounded-md border border-[#e0e0e0] px-3 transition focus-within:border-[#008080]">
                  <MdSearch size={18} className="text-[#999]" />
                  <input
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search.."
                    className="ml-2 w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              <Link
                href={withPreview("/dashboard/notifications")}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-md text-[#666] transition hover:bg-[#f5f5f5]"
                aria-label="Notifications"
              >
                <MdNotificationsNone size={24} />
                <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e74c3c] px-1 text-[10px] font-bold text-white">
                  1
                </span>
              </Link>

              <button
                type="button"
                onClick={openStoreWebsite}
                className="inline-flex items-center gap-2 rounded-lg border border-[#008080] bg-[#f8fffe] px-4 py-2 text-sm font-semibold text-[#008080] transition hover:bg-[#008080] hover:text-white"
                aria-label="View store in new tab"
                title="View Store"
              >
                <MdOpenInNew size={20} />
                View Store
              </button>

              <div className="relative">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-[#f5f5f5]"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  aria-label="User menu"
                >
                  <Image
                    src={avatarUrl}
                    alt="User avatar"
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  <div className="text-left">
                    <p className="text-sm font-bold">Jon Smith</p>
                    <p className="text-xs text-[#999]">Admin</p>
                  </div>
                </button>
                {profileMenuOpen ? (
                  <div className="absolute right-0 top-12 w-40 rounded-lg border border-[#e0e0e0] bg-white p-1 shadow-lg">
                    <Link
                      href="/profile"
                      className="block rounded-md px-3 py-2 text-sm hover:bg-[#f0fffe]"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="block rounded-md px-3 py-2 text-sm hover:bg-[#f0fffe]"
                    >
                      Settings
                    </Link>
                    <Link
                      href="/auth/login"
                      className="block rounded-md px-3 py-2 text-sm hover:bg-[#f0fffe]"
                    >
                      Logout
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6">
            <h1 className="text-[40px] font-bold leading-tight text-[#1a1a1a]">
              Dashboard Overview
            </h1>
            {!dismissWelcome ? (
              <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-[#b8ece8] bg-[#f0fffe] px-4 py-3 text-sm text-[#1a1a1a]">
                <p className="inline-flex items-center gap-2">
                  <MdInfoOutline className="text-[#008080]" size={18} />
                  👋 Welcome! Here are your key metrics
                </p>
                <button
                  type="button"
                  onClick={() => setDismissWelcome(true)}
                  className="rounded p-1 text-[#666] hover:bg-[#dff8f6]"
                  aria-label="Dismiss welcome banner"
                >
                  <MdClose size={18} />
                </button>
              </div>
            ) : null}
            <section className="rounded-2xl border border-[#e0e0e0] bg-gradient-to-r from-[#008080] to-[#0a6d6d] px-6 py-6 text-white shadow-sm">
              <p className="text-sm/6 opacity-90">Vendor Dashboard</p>
              <h2 className="mt-1 text-[40px] font-bold leading-tight">
                Welcome back, {userName} 👋
              </h2>
              <p className="mt-2 text-sm opacity-90">
                Track your storefront performance, recent orders, and revenue in one place.
              </p>
            </section>

            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {isLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-40 animate-pulse rounded-xl border border-[#e0e0e0] bg-white"
                    />
                  ))
                : kpis.map((item, index) => (
                    <article
                      key={item.label}
                      className="animate-form-fade group relative overflow-hidden rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition duration-200 [will-change:transform] hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(0,0,0,0.12)]"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <span className="pointer-events-none absolute -right-10 top-0 h-full w-24 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition duration-500 group-hover:translate-x-10 group-hover:opacity-100" />
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-[18px] font-bold text-[#1a1a1a]">{item.label}</h3>
                          <p className="mt-2 text-[36px] font-bold leading-none text-[#008080]">
                            {item.value}
                          </p>
                          <p
                            className={cn(
                              "mt-2 text-xs font-semibold",
                              item.trendDirection === "up" ? "text-[#27ae60]" : "text-[#e74c3c]"
                            )}
                          >
                            {item.trendDirection === "up" ? "▲" : "▼"} {item.trend}
                          </p>
                          <p className="mt-1 text-[12px] text-[#999]">vs. last month</p>
                        </div>
                        <div className="rounded-lg bg-[#f0fffe] p-2 text-[#008080]">
                          {item.icon === "users" ? <MdPeople size={24} /> : null}
                          {item.icon === "orders" ? <MdShoppingCart size={24} /> : null}
                          {item.icon === "vendors" ? <MdStore size={24} /> : null}
                          {item.icon === "earnings" ? <MdTrendingUp size={24} /> : null}
                        </div>
                      </div>
                      <div className="pointer-events-none absolute bottom-3 left-6 hidden rounded bg-[#1f2937] px-2 py-1 text-[11px] text-white group-hover:block">
                        {item.label}: {item.value} ({item.trend})
                      </div>
                    </article>
                  ))}
            </section>

            <section
              className="mt-6 grid gap-4 xl:grid-cols-[1fr_320px]"
              style={{ contentVisibility: "auto" }}
            >
              <article className="rounded-xl border border-[#e0e0e0] bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="inline-flex items-center gap-2 text-[24px] font-bold">
                    Revenue Trend
                    <span
                      className="text-sm font-normal text-[#999]"
                      title="Hover a point to see exact values"
                    >
                      ?
                    </span>
                  </h2>
                  <select className="rounded-md border border-[#e0e0e0] bg-white px-3 py-2 text-sm">
                    <option>6 Month</option>
                    <option>12 Month</option>
                  </select>
                </div>
                {isLoading ? (
                  <div className="mt-4 h-[280px] animate-pulse rounded-lg bg-[#f3f3f3]" />
                ) : (
                  <div className="mt-4 overflow-x-auto">
                    <div className="relative min-w-[760px]">
                      <svg
                        viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`}
                        className="h-[280px] w-full rounded-lg bg-white"
                        role="img"
                        aria-label="Revenue trend line chart for Jan to Jun"
                      >
                        <defs>
                          <linearGradient id="earningsGradient" x1="0%" x2="100%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#a78bfa" />
                          </linearGradient>
                          <linearGradient id="investedGradient" x1="0%" x2="100%">
                            <stop offset="0%" stopColor="#008080" />
                            <stop offset="100%" stopColor="#2dd4bf" />
                          </linearGradient>
                          <linearGradient id="expensesGradient" x1="0%" x2="100%">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#fb923c" />
                          </linearGradient>
                        </defs>
                        {[0, 1, 2, 3, 4].map((line) => (
                          <line
                            key={line}
                            x1={chartGeometry.padX}
                            y1={chartGeometry.padY + (chartGeometry.chartHeight / 4) * line}
                            x2={chartGeometry.width - chartGeometry.padX}
                            y2={chartGeometry.padY + (chartGeometry.chartHeight / 4) * line}
                            stroke="#ededed"
                          />
                        ))}
                        <polyline
                          fill="none"
                          stroke="url(#earningsGradient)"
                          strokeWidth="3"
                          points={chartGeometry.points(revenue.map((item) => item.earnings))}
                          className="animate-[fadeIn_0.9s_ease-in]"
                        />
                        <polyline
                          fill="none"
                          stroke="url(#investedGradient)"
                          strokeWidth="3"
                          points={chartGeometry.points(revenue.map((item) => item.invested))}
                          className="animate-[fadeIn_1s_ease-in]"
                        />
                        <polyline
                          fill="none"
                          stroke="url(#expensesGradient)"
                          strokeWidth="3"
                          points={chartGeometry.points(revenue.map((item) => item.expenses))}
                          className="animate-[fadeIn_1.1s_ease-in]"
                        />
                        {revenue.map((item, index) => {
                          const x =
                            chartGeometry.padX +
                            ((chartGeometry.width - chartGeometry.padX * 2) /
                              Math.max(revenue.length - 1, 1)) *
                              index;
                          const maxValue = Math.max(...revenue.map((point) => point.earnings), 1);
                          const y =
                            chartGeometry.padY +
                            (chartGeometry.chartHeight -
                              (item.earnings / maxValue) * chartGeometry.chartHeight);
                          return (
                            <circle
                              key={item.month}
                              cx={x}
                              cy={y}
                              r={hoveredMonthIndex === index ? 6 : 4}
                              fill="#6366f1"
                              className="cursor-pointer transition"
                              onMouseEnter={() => setHoveredMonthIndex(index)}
                              onFocus={() => setHoveredMonthIndex(index)}
                              tabIndex={0}
                              aria-label={`Show ${item.month} revenue details`}
                            />
                          );
                        })}
                      </svg>
                      {hoveredMonthIndex !== null && revenue[hoveredMonthIndex] ? (
                        <div className="pointer-events-none absolute right-6 top-4 rounded-md bg-[#1f2937] px-3 py-2 text-xs text-white">
                          {revenue[hoveredMonthIndex].month}:{" "}
                          {revenue[hoveredMonthIndex].earnings.toFixed(2)}k
                        </div>
                      ) : null}
                      <div className="mt-2 flex justify-between px-10 text-xs text-[#999]">
                        {revenue.map((item) => (
                          <span key={item.month}>{item.month}</span>
                        ))}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#666]">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#6366f1]" />
                          Earnings
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#008080]" />
                          Invested
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />
                          Expenses
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </article>

              <article className="rounded-xl border border-[#e0e0e0] bg-white p-5">
                <h2 className="text-[24px] font-bold">Sales by Category</h2>
                {isLoading ? (
                  <div className="mt-4 h-48 animate-pulse rounded-lg bg-[#f3f3f3]" />
                ) : (
                  <>
                    <div className="mt-4 flex items-center justify-center">
                      <svg
                        viewBox="0 0 100 100"
                        className="h-48 w-48"
                        role="img"
                        aria-label="Sales by category pie chart"
                      >
                        {pieArcs.map((slice) => (
                          <path key={slice.label} d={slice.d} fill={slice.color} />
                        ))}
                        <circle cx="50" cy="50" r="18" fill="white" />
                      </svg>
                    </div>
                    <ul className="mt-3 space-y-2 text-sm">
                      {pieArcs.map((slice) => (
                        <li key={slice.label} className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: slice.color }}
                            />
                            {slice.label}
                          </span>
                          <span className="font-semibold text-[#666]">{slice.value}%</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </article>
            </section>

            <section
              className="mt-6 rounded-xl border border-[#e0e0e0] bg-white p-5"
              style={{ contentVisibility: "auto" }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-[24px] font-bold">Recent Orders</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search.."
                    className="rounded-md border border-[#e0e0e0] px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    className="rounded-md border border-[#e0e0e0] px-2 py-2 text-[#666]"
                  >
                    <MdMoreVert size={18} />
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="mt-4 h-56 animate-pulse rounded-lg bg-[#f3f3f3]" />
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-[900px] border-collapse text-left">
                    <thead>
                      <tr className="bg-[#f5f5f5] text-sm font-bold text-[#333]">
                        {[
                          "Order ID",
                          "Customer",
                          "Item",
                          "Amount",
                          "Payment",
                          "Status",
                          "Date",
                          "Action"
                        ].map((header) => (
                          <th key={header} className="border-b border-[#e0e0e0] px-4 py-3">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((item) => (
                        <tr
                          key={item.id}
                          tabIndex={0}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") openEdit(item);
                            if (event.key === "Delete") setDeletingOrder(item);
                          }}
                          className="group h-14 text-sm text-[#666] transition hover:bg-[#f8fffe] focus:bg-[#f8fffe] focus:outline-none"
                          aria-label={`Order row ${item.id}`}
                        >
                          <td className="border-b border-[#e0e0e0] px-4 py-3 font-medium text-[#1a1a1a]">
                            #{item.id}
                          </td>
                          <td className="border-b border-[#e0e0e0] px-4 py-3">{item.customer}</td>
                          <td className="border-b border-[#e0e0e0] px-4 py-3">{item.item}</td>
                          <td className="border-b border-[#e0e0e0] px-4 py-3">{item.amount}</td>
                          <td className="border-b border-[#e0e0e0] px-4 py-3">
                            {item.paymentMethod}
                          </td>
                          <td className="border-b border-[#e0e0e0] px-4 py-3">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                                item.status === "Completed" && "bg-[#eafaf1] text-[#27ae60]",
                                item.status === "Pending" && "bg-[#fff8e6] text-[#f59e0b]",
                                item.status === "Cancelled" && "bg-[#fdecea] text-[#e74c3c]"
                              )}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="border-b border-[#e0e0e0] px-4 py-3">{item.orderedAt}</td>
                          <td className="border-b border-[#e0e0e0] px-4 py-3">
                            <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => openEdit(item)}
                                className="rounded p-2 text-[#008080] transition hover:bg-[#e6fbf9] hover:text-[#0a6d6d]"
                                aria-label={`Edit order ${item.id}`}
                                title="Edit order"
                              >
                                <MdEdit size={18} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingOrder(item)}
                                className="rounded p-2 text-[#e74c3c] transition hover:bg-[#fdecea] hover:text-[#c0392b]"
                                aria-label={`Delete order ${item.id}`}
                                title="Delete order"
                              >
                                <MdDelete size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {filteredOrders.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-[#d9e9e8] bg-[#f9fffe] p-6 text-center">
                  <p className="text-sm text-[#666]">
                    No orders yet. Create your first order to get started!
                  </p>
                  <button
                    type="button"
                    className="mt-3 rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0a6d6d]"
                  >
                    Create Order
                  </button>
                </div>
              ) : null}
            </section>

            <section
              className="mt-6 rounded-xl border border-[#e0e0e0] bg-white p-5"
              style={{ contentVisibility: "auto" }}
            >
              <h2 className="text-[24px] font-bold">Recent Activity</h2>
              {isLoading ? (
                <div className="mt-4 h-40 animate-pulse rounded-lg bg-[#f3f3f3]" />
              ) : null}
              {!isLoading ? (
                <ul className="relative mt-4 space-y-4 pl-4">
                  <span
                    className="absolute left-[10px] top-0 h-full w-0.5 bg-[#c7efec]"
                    aria-hidden="true"
                  />
                  {activity.map((item) => (
                    <li key={item.id} className="relative rounded-lg bg-white">
                      <span
                        className="absolute -left-4 top-2 h-3 w-3 rounded-full bg-[#008080]"
                        aria-hidden="true"
                      />
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-[#1a1a1a]">{item.title}</p>
                          <p className="mt-1 text-xs text-[#999]">{item.description}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <Image
                              src={item.avatarUrl}
                              alt={item.userName}
                              width={32}
                              height={32}
                              className="rounded-full object-cover"
                            />
                            <p className="text-xs text-[#666]">{item.userName}</p>
                          </div>
                        </div>
                        <p className="text-xs text-[#999]">{item.timeAgo}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          </main>
        </div>
      </div>

      {editingOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[24px] font-bold text-[#1a1a1a]">
                Edit Order #{editingOrder.id}
              </h3>
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="rounded p-1 text-[#666] hover:bg-[#f5f5f5]"
                aria-label="Close edit order modal"
              >
                <MdClose size={20} />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <label className="block">
                Customer name
                <input
                  value={editingOrder.customer}
                  readOnly
                  className="mt-1 w-full rounded-lg border border-[#e0e0e0] bg-[#f9f9f9] px-3 py-2"
                />
              </label>
              <label className="block">
                Order status
                <select
                  value={editingOrder.status}
                  onChange={(event) =>
                    setEditingOrder({
                      ...editingOrder,
                      status: event.target.value as OrderRow["status"]
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[#e0e0e0] px-3 py-2 focus:border-[#008080] focus:outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </label>
              <label className="block">
                Shipping address
                <input
                  value={editingOrder.shippingAddress ?? ""}
                  onChange={(event) =>
                    setEditingOrder({ ...editingOrder, shippingAddress: event.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-[#e0e0e0] px-3 py-2 focus:border-[#008080] focus:outline-none"
                />
              </label>
              <label className="block">
                Notes
                <textarea
                  value={editingOrder.notes ?? ""}
                  onChange={(event) =>
                    setEditingOrder({ ...editingOrder, notes: event.target.value })
                  }
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-[#e0e0e0] px-3 py-2 focus:border-[#008080] focus:outline-none"
                />
              </label>
              <label className="block">
                Tracking number
                <input
                  value={editingOrder.trackingNumber ?? ""}
                  onChange={(event) =>
                    setEditingOrder({ ...editingOrder, trackingNumber: event.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-[#e0e0e0] px-3 py-2 focus:border-[#008080] focus:outline-none"
                />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="rounded-lg border border-[#e0e0e0] bg-[#f0f0f0] px-4 py-2 text-sm font-semibold text-[#1a1a1a]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0a6d6d]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deletingOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fdecea] text-[#e74c3c]">
              <MdWarningAmber size={32} />
            </div>
            <h3 className="mt-4 text-center text-[24px] font-bold text-[#e74c3c]">Delete Order?</h3>
            <p className="mt-2 text-center text-[16px] text-[#666]">
              Are you sure you want to delete order #{deletingOrder.id}? This action cannot be
              undone.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setDeletingOrder(null)}
                className="rounded-lg border border-[#e0e0e0] bg-[#f0f0f0] px-4 py-2 text-sm font-semibold text-[#1a1a1a]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-lg bg-[#e74c3c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c0392b]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div
          className={cn(
            "fixed right-4 top-4 z-[60] rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-lg",
            toast.type === "success" && "bg-[#27ae60]",
            toast.type === "error" && "bg-[#e74c3c]",
            toast.type === "warning" && "bg-[#f59e0b]"
          )}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}

function DashboardSidebar({
  pathname,
  mobileOpen,
  onCloseMobile,
  withPreview
}: {
  pathname: string;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  withPreview: (href: string) => string;
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
          className="mb-4 rounded p-1 md:hidden"
          onClick={onCloseMobile}
          aria-label="Close sidebar"
        >
          ✕
        </button>

        <nav aria-label="Sidebar navigation">
          <ul className="space-y-2 text-sm">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={withPreview(item.href)}
                    className={cn(
                      "flex items-center rounded-l-xl border-l-4 border-transparent px-3 py-2 text-[#333] transition-all duration-200 hover:bg-[#f0fffe]",
                      isActive && "border-[#008080] bg-[#f0fffe] text-[#008080]"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={24} className="text-[#008080]" />
                      {item.label}
                    </span>
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
