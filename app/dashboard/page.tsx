"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { cn } from "@/lib/cn";

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

type Product = {
  id: string;
  product: string;
  category: string;
  brand: string;
  price: string;
  stock: number;
  rating: number;
  order: number;
  sales: string;
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
  {
    label: "Dashboard",
    href: "/dashboard",
    children: [
      { label: "E-Commerce", href: "/dashboard/ecommerce" },
      { label: "Analytics", href: "/dashboard/analytics" },
      { label: "CRM", href: "/dashboard/crm" }
    ]
  },
  { label: "Orders", href: "/dashboard/orders" },
  { label: "Seller List", href: "/dashboard/sellers" },
  { label: "Customers", href: "/dashboard/customers" },
  { label: "Products", href: "/dashboard/products" },
  { label: "Invoices", href: "/dashboard/invoices" },
  { label: "Authentication", href: "/dashboard/auth" },
  { label: "Help", href: "/dashboard/help" },
  { label: "Settings", href: "/dashboard/settings" }
];

export default function DashboardPage() {
  const pathname = usePathname() ?? "/dashboard";
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [dashboardExpanded, setDashboardExpanded] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(4);
  const [searchValue, setSearchValue] = useState("");

  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [userName, setUserName] = useState("Smith");
  const [avatarUrl, setAvatarUrl] = useState("https://i.pravatar.cc/80?img=12");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [kpiRes, revenueRes, productsRes, activityRes] = await Promise.all([
          apiRequest<{ items: Kpi[] }>("/api/dashboard/kpi"),
          apiRequest<{ points: RevenuePoint[] }>("/api/dashboard/revenue"),
          apiRequest<{ items: Product[] }>("/api/dashboard/products"),
          apiRequest<{ items: Activity[] }>("/api/dashboard/activity")
        ]);
        setKpis(kpiRes.data.items);
        setRevenue(revenueRes.data.points);
        setProducts(productsRes.data.items);
        setActivity(activityRes.data.items);
      } catch {
        // Keep dashboard stable even if any endpoint fails.
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

  const filteredProducts = useMemo(() => {
    if (!searchValue.trim()) return products;
    const value = searchValue.toLowerCase();
    return products.filter(
      (item) =>
        item.product.toLowerCase().includes(value) ||
        item.brand.toLowerCase().includes(value) ||
        item.category.toLowerCase().includes(value)
    );
  }, [products, searchValue]);

  const chartGeometry = useMemo(() => {
    const width = 760;
    const height = 260;
    const padX = 40;
    const padY = 30;
    const chartWidth = width - padX * 2;
    const chartHeight = height - padY * 2;
    const maxValue = Math.max(...revenue.flatMap((item) => [item.earnings, item.invested, item.expenses]), 1);

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

  return (
    <div className="animate-form-fade min-h-screen bg-[#f4f6f8] text-[#1a1a1a]">
      <div className="flex">
        <DashboardSidebar
          pathname={pathname}
          mobileOpen={mobileSidebarOpen}
          dashboardExpanded={dashboardExpanded}
          onToggleDashboard={() => setDashboardExpanded((prev) => !prev)}
          onCloseMobile={() => setMobileSidebarOpen(false)}
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
                ☰
              </button>

              <div className="hidden items-center gap-2 lg:flex">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#008080] text-lg font-bold text-white">
                  B
                </div>
                <p className="text-lg font-bold">Biko</p>
              </div>

              <div className="min-w-[240px] flex-1">
                <p className="text-[18px] font-semibold text-[#333]">Good morning, {userName}!</p>
                <div className="mt-2 flex h-11 w-full max-w-[300px] items-center rounded-md border border-[#e0e0e0] px-3 transition focus-within:border-[#008080]">
                  <span className="text-sm text-[#999]">🔎</span>
                  <input
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search.."
                    className="ml-2 w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-md text-xl text-[#666] transition hover:bg-[#f5f5f5]"
                aria-label="Notifications"
              >
                🔔
                <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e74c3c] px-1 text-[10px] font-bold text-white">
                  1
                </span>
              </button>

              <div className="relative">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-[#f5f5f5]"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  aria-label="User menu"
                >
                  <Image src={avatarUrl} alt="User avatar" width={40} height={40} className="rounded-full object-cover" />
                  <div className="text-left">
                    <p className="text-sm font-bold">Jon Smith</p>
                    <p className="text-xs text-[#999]">Admin</p>
                  </div>
                </button>
                {profileMenuOpen ? (
                  <div className="absolute right-0 top-12 w-40 rounded-lg border border-[#e0e0e0] bg-white p-1 shadow-lg">
                    <Link href="/profile" className="block rounded-md px-3 py-2 text-sm hover:bg-[#f0fffe]">
                      Profile
                    </Link>
                    <Link href="/dashboard/settings" className="block rounded-md px-3 py-2 text-sm hover:bg-[#f0fffe]">
                      Settings
                    </Link>
                    <Link href="/auth/login" className="block rounded-md px-3 py-2 text-sm hover:bg-[#f0fffe]">
                      Logout
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {kpis.map((item, index) => (
                <article
                  key={item.label}
                  className="animate-form-fade rounded-xl border border-[#e0e0e0] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[28px] font-bold text-[#008080]">{item.value}</p>
                      <p className="text-xs text-[#999]">{item.label}</p>
                      <p
                        className={cn(
                          "mt-2 text-xs font-semibold",
                          item.trendDirection === "up" ? "text-[#27ae60]" : "text-[#e74c3c]"
                        )}
                      >
                        {item.trendDirection === "up" ? "▲" : "▼"} {item.trend}
                      </p>
                    </div>
                    <div className="text-2xl text-[#008080]" aria-hidden="true">
                      {item.icon === "users" ? "👥" : item.icon === "orders" ? "🧾" : item.icon === "vendors" ? "🏬" : "💼"}
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <section className="mt-6 grid gap-4 xl:grid-cols-[1fr_320px]">
              <article className="rounded-xl border border-[#e0e0e0] bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-[18px] font-bold">Revenue Report</h2>
                  <select className="rounded-md border border-[#e0e0e0] bg-white px-3 py-2 text-sm">
                    <option>6 Month</option>
                    <option>12 Month</option>
                  </select>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-[#999]">Earnings</p>
                    <p className="font-bold text-[#008080]">3,384.78k</p>
                  </div>
                  <div>
                    <p className="text-[#999]">Invested</p>
                    <p className="font-bold text-[#008080]">2,690.89k</p>
                  </div>
                  <div>
                    <p className="text-[#999]">Expenses</p>
                    <p className="font-bold text-[#f59e0b]">1,980.25k</p>
                  </div>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <div className="relative min-w-[760px]">
                    <svg
                      viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`}
                      className="h-[280px] w-full rounded-lg bg-white"
                      role="img"
                      aria-label="Revenue report line chart for Jan to Jun"
                    >
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
                        stroke="#6366f1"
                        strokeWidth="3"
                        points={chartGeometry.points(revenue.map((item) => item.earnings))}
                      />
                      <polyline
                        fill="none"
                        stroke="#008080"
                        strokeWidth="3"
                        points={chartGeometry.points(revenue.map((item) => item.invested))}
                      />
                      <polyline
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="3"
                        points={chartGeometry.points(revenue.map((item) => item.expenses))}
                      />

                      {revenue.map((item, index) => {
                        const x =
                          chartGeometry.padX + ((chartGeometry.width - chartGeometry.padX * 2) / Math.max(revenue.length - 1, 1)) * index;
                        const maxValue = Math.max(...revenue.map((point) => point.earnings), 1);
                        const y =
                          chartGeometry.padY +
                          (chartGeometry.chartHeight - (item.earnings / maxValue) * chartGeometry.chartHeight);
                        return (
                          <circle
                            key={item.month}
                            cx={x}
                            cy={y}
                            r={hoveredPoint === index ? 6 : 4}
                            fill="#6366f1"
                            className="cursor-pointer transition"
                            onMouseEnter={() => setHoveredPoint(index)}
                          />
                        );
                      })}
                    </svg>
                    <div className="mt-2 flex justify-between px-10 text-xs text-[#999]">
                      {revenue.map((item) => (
                        <span key={item.month}>{item.month}</span>
                      ))}
                    </div>
                    {hoveredPoint !== null && revenue[hoveredPoint] ? (
                      <div className="pointer-events-none absolute left-[60%] top-20 rounded-md bg-[#1f2937] px-3 py-2 text-xs text-white">
                        Earnings: {revenue[hoveredPoint].earnings.toFixed(2)}k
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>

              <article className="rounded-xl border border-[#e0e0e0] bg-white p-5">
                <h2 className="text-[18px] font-bold">Recent Activity</h2>
                <ul className="relative mt-4 space-y-4 pl-4">
                  <span className="absolute left-[10px] top-0 h-full w-0.5 bg-[#c7efec]" aria-hidden="true" />
                  {activity.map((item) => (
                    <li key={item.id} className="relative rounded-lg bg-white">
                      <span className="absolute -left-4 top-2 h-3 w-3 rounded-full bg-[#008080]" aria-hidden="true" />
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-[#1a1a1a]">{item.title}</p>
                          <p className="mt-1 text-xs text-[#999]">{item.description}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <Image src={item.avatarUrl} alt={item.userName} width={32} height={32} className="rounded-full object-cover" />
                            <p className="text-xs text-[#666]">{item.userName}</p>
                          </div>
                        </div>
                        <p className="text-xs text-[#999]">{item.timeAgo}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            </section>

            <section className="mt-6 rounded-xl border border-[#e0e0e0] bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-[18px] font-bold">Best Selling Product</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search.."
                    className="rounded-md border border-[#e0e0e0] px-3 py-2 text-sm"
                  />
                  <select className="rounded-md border border-[#e0e0e0] px-3 py-2 text-sm">
                    <option>Easy</option>
                  </select>
                  <select className="rounded-md border border-[#e0e0e0] px-3 py-2 text-sm">
                    <option>Mans</option>
                  </select>
                  <select className="rounded-md border border-[#e0e0e0] px-3 py-2 text-sm">
                    <option>10 Row</option>
                  </select>
                  <button type="button" className="rounded-md border border-[#e0e0e0] px-3 py-2 text-sm">
                    ⋯
                  </button>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-[1200px] border-collapse text-left">
                  <thead>
                    <tr className="bg-[#f5f5f5] text-sm font-bold text-[#333]">
                      {["ID", "PRODUCT", "CATEGORY", "BRAND", "PRICE", "STOCK", "RATING", "ORDER", "SALES", "ACTION"].map((header) => (
                        <th key={header} className="border-b border-[#e0e0e0] px-4 py-3">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((item) => (
                      <tr
                        key={item.id}
                        className="h-14 text-sm text-[#666] transition hover:-translate-y-0.5 hover:bg-[#f0fffe] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
                      >
                        <td className="sticky left-0 border-b border-[#e0e0e0] bg-white px-4 py-3">#{item.id}</td>
                        <td className="border-b border-[#e0e0e0] px-4 py-3">{item.product}</td>
                        <td className="border-b border-[#e0e0e0] px-4 py-3">{item.category}</td>
                        <td className="border-b border-[#e0e0e0] px-4 py-3">{item.brand}</td>
                        <td className="border-b border-[#e0e0e0] px-4 py-3">{item.price}</td>
                        <td className="border-b border-[#e0e0e0] px-4 py-3">{item.stock}</td>
                        <td className="border-b border-[#e0e0e0] px-4 py-3">⭐ {item.rating}</td>
                        <td className="border-b border-[#e0e0e0] px-4 py-3">{item.order}</td>
                        <td className="border-b border-[#e0e0e0] px-4 py-3">{item.sales}</td>
                        <td className="border-b border-[#e0e0e0] px-4 py-3">
                          <button type="button" className="rounded px-2 py-1 hover:bg-[#f5f5f5]">
                            ⋯
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#666]">
                <p>Showing {Math.min(filteredProducts.length, 6)} of 20 Result</p>
                <div className="flex items-center gap-2">
                  <button type="button" disabled className="cursor-not-allowed rounded border border-[#e0e0e0] px-3 py-2 text-[#999]">
                    Previous
                  </button>
                  <button type="button" className="rounded bg-[#1f2937] px-3 py-2 text-white">
                    01
                  </button>
                  <button type="button" className="rounded border border-[#e0e0e0] px-3 py-2">
                    Next
                  </button>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

function DashboardSidebar({
  pathname,
  mobileOpen,
  dashboardExpanded,
  onToggleDashboard,
  onCloseMobile
}: {
  pathname: string;
  mobileOpen: boolean;
  dashboardExpanded: boolean;
  onToggleDashboard: () => void;
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
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#008080] text-xl font-bold text-white">
              B
            </div>
            <p className="text-lg font-bold">Biko</p>
          </div>
          <button type="button" className="rounded p-1 md:hidden" onClick={onCloseMobile} aria-label="Close sidebar">
            ✕
          </button>
        </div>

        <nav aria-label="Sidebar navigation">
          <ul className="space-y-2 text-sm">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              if (item.children) {
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={onToggleDashboard}
                      className={cn(
                        "flex w-full items-center justify-between rounded-l-xl px-3 py-2 text-[#333] transition hover:bg-[#f0fffe]",
                        isActive && "bg-[#008080] text-white"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base">📊</span>
                        {item.label}
                      </span>
                      <span>{dashboardExpanded ? "▾" : "▸"}</span>
                    </button>
                    {dashboardExpanded ? (
                      <ul className="mt-1 space-y-1 pl-7">
                        {item.children.map((child) => {
                          const isChildActive = pathname === child.href;
                          return (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className={cn(
                                  "block rounded-lg px-2 py-1.5 text-xs transition hover:bg-[#f0fffe]",
                                  isChildActive ? "bg-[#008080] text-white" : "text-[#333]"
                                )}
                              >
                                {child.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </li>
                );
              }

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between rounded-l-xl px-3 py-2 text-[#333] transition hover:bg-[#f0fffe]",
                      isActive && "bg-[#008080] text-white"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base text-[#008080]">●</span>
                      {item.label}
                    </span>
                    <span>▸</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-6 rounded-lg border border-[#e0e0e0] bg-white p-3 text-xs text-[#666]">
          <p className="font-semibold text-[#1a1a1a]">Future Expandable</p>
          <ul className="mt-2 space-y-1">
            <li>Store section</li>
            <li>Order List</li>
            <li>Customer List</li>
            <li>Webstore</li>
            <li>Invoicing</li>
            <li>Subscription</li>
            <li>Settings</li>
          </ul>
        </div>
      </aside>
    </>
  );
}
