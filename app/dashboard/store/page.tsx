"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  MdCheckCircle,
  MdDashboard,
  MdDelete,
  MdEdit,
  MdHelp,
  MdInventory2,
  MdReceiptLong,
  MdSentimentSatisfied,
  MdSettings,
  MdShare,
  MdStore,
  MdTrendingUp,
  MdWarning,
  MdFavoriteBorder,
  MdClose
} from "react-icons/md";
import { apiRequest } from "@/lib/api-client";
import { cn } from "@/lib/cn";

type Tab = "overview" | "settings" | "analytics" | "reviews";
type SettingsSubTab = "general" | "business" | "branding" | "delivery" | "policies" | "payment";
type TimeRange = "7d" | "30d" | "90d";

type StoreOverviewData = {
  name: string;
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
  description: string;
  email: string;
  phone: string;
  website: string;
  bannerUrl: string;
  logoUrl: string;
  social: {
    facebook?: string;
    instagram?: string;
    x?: string;
    linkedin?: string;
  };
};

type Statistic = {
  title: string;
  value: string;
  delta: string;
  helper: string;
  icon: "sales" | "orders" | "products" | "satisfaction";
};

type StorePerformanceData = {
  responseTime: string;
  fulfillmentRate: string;
  returnRate: string;
  repeatRate: string;
};

type HealthItem = {
  id: string;
  label: string;
  status: "completed" | "warning";
  actionLabel?: string;
};

type Activity = {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
};

type Product = {
  id: string;
  image: string;
  name: string;
  price: string;
  salesCount: number;
  rating: number;
  stock: "In stock" | "Low stock" | "Out of stock";
};

type Review = {
  id: string;
  customer: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
  helpful: number;
};

type AnalyticsData = {
  salesTrend: Array<{ label: string; value: number }>;
  orderVolume: Array<{ label: string; value: number }>;
  trafficSources: Array<{ label: string; value: number; color: string }>;
  topProducts: Array<{ name: string; orders: number; revenue: string }>;
};

type SettingsValues = {
  name: string;
  category: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  status: string;
  timezone: string;
  currency: string;
};

const emptyOverview: StoreOverviewData = {
  name: "Acme Storefront",
  category: "Lifestyle",
  location: "Lagos, Nigeria",
  rating: 4.8,
  reviewCount: 2345,
  description: "A modern vendor storefront focused on delightful customer experiences.",
  email: "hello@acmestore.com",
  phone: "+234 800 123 9999",
  website: "https://acmestore.com",
  bannerUrl: "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=1400&q=80",
  logoUrl: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=300&q=80",
  social: {
    facebook: "facebook.com/acmestore",
    instagram: "instagram.com/acmestore",
    x: "x.com/acmestore"
  }
};

export default function StoreSectionPage() {
  const searchParams = useSearchParams();
  const isPreviewMode = searchParams?.get("preview") === "1";
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [settingsSubTab, setSettingsSubTab] = useState<SettingsSubTab>("general");
  const [range, setRange] = useState<TimeRange>("30d");
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState<StoreOverviewData>(emptyOverview);
  const [stats, setStats] = useState<Statistic[]>([]);
  const [performance, setPerformance] = useState<StorePerformanceData>({
    responseTime: "1h 24m",
    fulfillmentRate: "95.8%",
    returnRate: "2.4%",
    repeatRate: "41%"
  });
  const [health, setHealth] = useState<HealthItem[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    salesTrend: [],
    orderVolume: [],
    trafficSources: [],
    topProducts: []
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewSearch, setReviewSearch] = useState("");
  const [reviewSort, setReviewSort] = useState<"latest" | "highest" | "lowest">("latest");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [formValues, setFormValues] = useState<SettingsValues>({
    name: "",
    category: "",
    description: "",
    email: "",
    phone: "",
    website: "",
    status: "Active",
    timezone: "Africa/Lagos",
    currency: "USD"
  });

  useEffect(() => {
    async function loadStoreData() {
      try {
        const [
          overviewRes,
          statsRes,
          activityRes,
          productsRes,
          reviewsRes,
          healthRes,
          analyticsRes
        ] = await Promise.all([
          apiRequest<{ overview: StoreOverviewData }>("/api/store/overview"),
          apiRequest<{ items: Statistic[]; performance: StorePerformanceData }>(
            "/api/store/statistics"
          ),
          apiRequest<{ items: Activity[] }>("/api/store/activity"),
          apiRequest<{ items: Product[] }>("/api/store/products/top"),
          apiRequest<{ items: Review[] }>("/api/store/reviews"),
          apiRequest<{ items: HealthItem[] }>("/api/store/health"),
          apiRequest<{ analytics: AnalyticsData }>("/api/store/analytics")
        ]);

        setOverview(overviewRes.data.overview);
        setStats(statsRes.data.items);
        setPerformance(statsRes.data.performance);
        setActivity(activityRes.data.items);
        setProducts(productsRes.data.items);
        setReviews(reviewsRes.data.items);
        setHealth(healthRes.data.items);
        setAnalytics(analyticsRes.data.analytics);
        setFormValues({
          name: overviewRes.data.overview.name,
          category: overviewRes.data.overview.category,
          description: overviewRes.data.overview.description,
          email: overviewRes.data.overview.email,
          phone: overviewRes.data.overview.phone,
          website: overviewRes.data.overview.website,
          status: "Active",
          timezone: "Africa/Lagos",
          currency: "USD"
        });
      } catch {
        setToast({ type: "error", message: "Could not load store data. Using defaults." });
      } finally {
        setIsLoading(false);
      }
    }

    void loadStoreData();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  const filteredReviews = useMemo(() => {
    const searched = reviews.filter((review) => {
      const q = reviewSearch.toLowerCase();
      return review.customer.toLowerCase().includes(q) || review.text.toLowerCase().includes(q);
    });

    const sorted = [...searched].sort((a, b) => {
      if (reviewSort === "highest") return b.rating - a.rating;
      if (reviewSort === "lowest") return a.rating - b.rating;
      return b.id.localeCompare(a.id);
    });

    return sorted;
  }, [reviews, reviewSearch, reviewSort]);

  const pagedReviews = useMemo(
    () => filteredReviews.slice((page - 1) * 10, page * 10),
    [filteredReviews, page]
  );

  function withPreview(href: string): string {
    if (!isPreviewMode) return href;
    return href.includes("?") ? `${href}&preview=1` : `${href}?preview=1`;
  }

  async function handleSaveStore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await apiRequest<{ message: string }>("/api/store/update", {
        method: "PUT",
        body: JSON.stringify(formValues)
      });
      setOverview((prev) => ({
        ...prev,
        name: formValues.name,
        category: formValues.category,
        description: formValues.description,
        email: formValues.email,
        phone: formValues.phone,
        website: formValues.website
      }));
      setEditModalOpen(false);
      setToast({ type: "success", message: "Store updated successfully" });
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Update failed"
      });
    }
  }

  return (
    <main className="min-h-screen bg-white px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-4 text-sm text-[#666]" aria-label="Breadcrumb">
          <Link href={withPreview("/dashboard")} className="text-[#008080] hover:underline">
            Dashboard
          </Link>{" "}
          &gt; <span>Store section</span>
        </nav>

        <h1 className="text-[40px] font-bold text-[#008080]">Store Management</h1>

        <div className="mt-5 flex flex-wrap gap-2">
          {[
            { id: "overview", label: "Overview" },
            { id: "settings", label: "Settings" },
            { id: "analytics", label: "Analytics" },
            { id: "reviews", label: "Reviews" }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as Tab)}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-semibold transition duration-200",
                activeTab === tab.id
                  ? "border-[#008080] bg-[#008080] text-white"
                  : "border-[#e0e0e0] bg-white text-[#1a1a1a] hover:bg-[#f0fffe]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <section className="animate-form-fade mt-4">
          {activeTab === "overview" ? (
            <>
              <StoreHeader overview={overview} onEdit={() => setEditModalOpen(true)} />

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {(isLoading ? Array.from({ length: 4 }) : stats).map((item, index) =>
                  isLoading ? (
                    <div
                      key={index}
                      className="h-36 animate-pulse rounded-xl border border-[#e0e0e0] bg-[#f9f9f9]"
                    />
                  ) : (
                    <StatisticsCard key={(item as Statistic).title} stat={item as Statistic} />
                  )
                )}
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <StoreInfo overview={overview} onEdit={() => setEditModalOpen(true)} />
                <StorePerformance performance={performance} />
              </div>

              <div className="mt-5">
                <StoreHealth items={health} />
              </div>

              <div className="mt-5">
                <ActivityTimeline items={activity} />
              </div>

              <div className="mt-5">
                <TopProducts products={products} />
              </div>

              <div className="mt-5">
                <CustomerReviews reviews={reviews} />
              </div>
            </>
          ) : null}

          {activeTab === "settings" ? (
            <SettingsForm
              subTab={settingsSubTab}
              onSubTabChange={setSettingsSubTab}
              values={formValues}
              onChange={setFormValues}
              onSave={handleSaveStore}
              onDelete={() => setDeleteModalOpen(true)}
            />
          ) : null}

          {activeTab === "analytics" ? (
            <Analytics analytics={analytics} range={range} onRangeChange={setRange} />
          ) : null}

          {activeTab === "reviews" ? (
            <ReviewsList
              reviews={pagedReviews}
              total={filteredReviews.length}
              search={reviewSearch}
              onSearch={setReviewSearch}
              sort={reviewSort}
              onSort={setReviewSort}
              page={page}
              onPageChange={setPage}
            />
          ) : null}
        </section>
      </div>

      <EditStoreModal
        open={editModalOpen}
        values={formValues}
        onChange={setFormValues}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleSaveStore}
      />
      <DeleteStoreDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          setDeleteModalOpen(false);
          setToast({ type: "success", message: "Store removed successfully (demo)." });
        }}
      />

      {toast ? (
        <div
          className={cn(
            "fixed right-4 top-4 z-50 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-lg",
            toast.type === "success" ? "bg-[#27ae60]" : "bg-[#e74c3c]"
          )}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      ) : null}
    </main>
  );
}

function StoreHeader({ overview, onEdit }: { overview: StoreOverviewData; onEdit: () => void }) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#e0e0e0] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <div className="relative h-[220px] sm:h-[300px]">
        <Image
          src={overview.bannerUrl}
          alt="Store banner"
          fill
          unoptimized
          className="object-cover"
        />
      </div>
      <div className="relative px-6 pb-6 pt-16">
        <div className="absolute -top-14 left-6 h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-md sm:h-[120px] sm:w-[120px]">
          <Image
            src={overview.logoUrl}
            alt="Store logo"
            fill
            unoptimized
            className="object-cover"
          />
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[24px] font-bold text-[#1a1a1a]">{overview.name}</h2>
            <p className="text-sm text-[#666]">
              {overview.category} • {overview.location}
            </p>
            <p className="mt-1 text-sm text-[#666]">
              ⭐ {overview.rating} ({overview.reviewCount.toLocaleString()} reviews)
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1 rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:scale-[1.02] hover:bg-[#0a6d6d]"
            >
              <MdEdit size={18} /> Edit Store
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-[#008080] px-4 py-2 text-sm font-semibold text-[#008080] transition duration-200 hover:scale-[1.02] hover:bg-[#f0fffe]"
            >
              <MdShare size={18} /> Share Store
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatisticsCard({ stat }: { stat: Statistic }) {
  const icon =
    stat.icon === "sales"
      ? MdTrendingUp
      : stat.icon === "orders"
        ? MdReceiptLong
        : stat.icon === "products"
          ? MdInventory2
          : MdSentimentSatisfied;
  const Icon = icon;
  const deltaPositive = !stat.delta.startsWith("-");
  return (
    <article className="rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_12px_24px_rgba(0,0,0,0.12)]">
      <div className="flex items-start justify-between">
        <h3 className="text-[18px] font-bold text-[#1a1a1a]">{stat.title}</h3>
        <Icon size={24} className="text-[#008080]" aria-hidden="true" />
      </div>
      <p className="mt-3 text-3xl font-bold text-[#008080]">{stat.value}</p>
      <p
        className={cn(
          "mt-1 text-sm font-semibold",
          deltaPositive ? "text-[#27ae60]" : "text-[#e74c3c]"
        )}
      >
        {deltaPositive ? "▲" : "▼"} {stat.delta}
      </p>
      <p className="mt-1 text-xs text-[#999]">{stat.helper}</p>
    </article>
  );
}

function StoreInfo({ overview, onEdit }: { overview: StoreOverviewData; onEdit: () => void }) {
  return (
    <section className="rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between">
        <h2 className="text-[24px] font-bold">Store Information</h2>
        <button
          type="button"
          onClick={onEdit}
          className="text-sm font-semibold text-[#008080] hover:underline"
        >
          Edit
        </button>
      </div>
      <div className="mt-4 space-y-2 text-sm text-[#666]">
        <p>
          <span className="font-semibold text-[#1a1a1a]">Name:</span> {overview.name}
        </p>
        <p>
          <span className="font-semibold text-[#1a1a1a]">Category:</span> {overview.category}
        </p>
        <p>
          <span className="font-semibold text-[#1a1a1a]">Description:</span> {overview.description}
        </p>
        <p>
          <span className="font-semibold text-[#1a1a1a]">Email:</span> {overview.email}
        </p>
        <p>
          <span className="font-semibold text-[#1a1a1a]">Phone:</span> {overview.phone}
        </p>
        <p>
          <span className="font-semibold text-[#1a1a1a]">Location:</span> {overview.location}
        </p>
        <p>
          <span className="font-semibold text-[#1a1a1a]">Website:</span> {overview.website}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#008080]">
        {Object.entries(overview.social).map(([key, value]) => (
          <a
            key={key}
            href={`https://${value}`}
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            {key}
          </a>
        ))}
      </div>
    </section>
  );
}

function StorePerformance({ performance }: { performance: StorePerformanceData }) {
  const metrics = [
    ["Average response time", performance.responseTime],
    ["Order fulfillment rate", performance.fulfillmentRate],
    ["Return rate", performance.returnRate],
    ["Repeat customer rate", performance.repeatRate]
  ];
  return (
    <section className="rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <h2 className="text-[24px] font-bold">Store Performance</h2>
      <ul className="mt-4 space-y-3 text-sm">
        {metrics.map(([label, value]) => (
          <li
            key={label}
            className="flex items-center justify-between rounded-lg bg-[#f9f9f9] px-3 py-2"
          >
            <span className="text-[#666]">{label}</span>
            <span className="font-semibold text-[#1a1a1a]">{value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function StoreHealth({ items }: { items: HealthItem[] }) {
  return (
    <section className="rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <h2 className="text-[24px] font-bold">Store Health</h2>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#e0e0e0] px-3 py-2"
          >
            <span className="inline-flex items-center gap-2 text-sm">
              {item.status === "completed" ? (
                <MdCheckCircle size={18} className="text-[#27ae60]" />
              ) : (
                <MdWarning size={18} className="text-[#f59e0b]" />
              )}
              {item.label}
            </span>
            {item.actionLabel ? (
              <button
                type="button"
                className="text-sm font-semibold text-[#008080] hover:underline"
              >
                {item.actionLabel}
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ActivityTimeline({ items }: { items: Activity[] }) {
  return (
    <section className="rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[24px] font-bold">Recent Activity</h2>
        <Link
          href="/dashboard/store"
          className="text-sm font-semibold text-[#008080] hover:underline"
        >
          View all
        </Link>
      </div>
      <ul className="relative mt-4 space-y-4 pl-4">
        <span className="absolute left-[8px] top-0 h-full w-0.5 bg-[#d8f2ef]" aria-hidden="true" />
        {items.map((item) => (
          <ActivityItem key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}

function ActivityItem({ item }: { item: Activity }) {
  return (
    <li className="relative">
      <span
        className="absolute -left-4 top-1.5 h-3 w-3 rounded-full bg-[#008080]"
        aria-hidden="true"
      />
      <p className="text-sm font-semibold text-[#1a1a1a]">{item.title}</p>
      <p className="text-sm text-[#666]">{item.detail}</p>
      <p className="text-xs text-[#999]">{item.timestamp}</p>
    </li>
  );
}

function TopProducts({ products }: { products: Product[] }) {
  return (
    <section>
      <h2 className="text-[24px] font-bold">Top Performing Products</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(0,0,0,0.12)]">
      <div className="relative h-36 overflow-hidden rounded-lg bg-[#f5f5f5]">
        <Image src={product.image} alt={product.name} fill unoptimized className="object-cover" />
      </div>
      <h3 className="mt-3 text-[18px] font-bold">{product.name}</h3>
      <p className="text-sm text-[#666]">{product.price}</p>
      <p className="text-sm text-[#666]">
        Sales: {product.salesCount} • ⭐ {product.rating.toFixed(1)}
      </p>
      <p
        className={cn(
          "text-xs font-semibold",
          product.stock === "In stock"
            ? "text-[#27ae60]"
            : product.stock === "Low stock"
              ? "text-[#f59e0b]"
              : "text-[#e74c3c]"
        )}
      >
        {product.stock}
      </p>
      <button
        type="button"
        className="mt-3 rounded-lg border border-[#008080] px-3 py-2 text-sm font-semibold text-[#008080] hover:bg-[#f0fffe]"
      >
        View Details
      </button>
    </article>
  );
}

function CustomerReviews({ reviews }: { reviews: Review[] }) {
  const ratingBreakdown = [
    { star: 5, percent: 60 },
    { star: 4, percent: 25 },
    { star: 3, percent: 9 },
    { star: 2, percent: 4 },
    { star: 1, percent: 2 }
  ];

  return (
    <section className="rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[24px] font-bold">Customer Reviews</h2>
        <Link
          href="/dashboard/store"
          className="text-sm font-semibold text-[#008080] hover:underline"
        >
          See all reviews
        </Link>
      </div>
      <p className="mt-1 text-sm text-[#666]">4.8/5 ({reviews.length.toLocaleString()} reviews)</p>

      <div className="mt-4 space-y-2">
        {ratingBreakdown.map((item) => (
          <div key={item.star} className="flex items-center gap-2 text-sm">
            <span className="w-10 text-[#666]">{item.star}★</span>
            <div className="h-2 flex-1 rounded-full bg-[#f0f0f0]">
              <div
                className="h-2 rounded-full bg-[#008080]"
                style={{ width: `${item.percent}%` }}
              />
            </div>
            <span className="w-12 text-right text-[#666]">{item.percent}%</span>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {reviews.slice(0, 3).map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="rounded-lg border border-[#e0e0e0] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Image
            src={review.avatar}
            alt={review.customer}
            width={36}
            height={36}
            unoptimized
            className="rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-semibold">{review.customer}</p>
            <p className="text-xs text-[#999]">{review.date}</p>
          </div>
        </div>
        <p className="text-sm text-[#666]">{"★".repeat(Math.round(review.rating))}</p>
      </div>
      <p className="mt-2 line-clamp-3 text-sm text-[#666]">{review.text}</p>
      <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#999]">
        <MdFavoriteBorder size={14} /> {review.helpful} helpful
      </p>
    </article>
  );
}

function SettingsForm({
  subTab,
  onSubTabChange,
  values,
  onChange,
  onSave,
  onDelete
}: {
  subTab: SettingsSubTab;
  onSubTabChange: (value: SettingsSubTab) => void;
  values: SettingsValues;
  onChange: (value: SettingsValues) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: () => void;
}) {
  return (
    <section className="rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <h2 className="text-[24px] font-bold">Settings</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {(
          ["general", "business", "branding", "delivery", "policies", "payment"] as SettingsSubTab[]
        ).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onSubTabChange(tab)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-semibold",
              subTab === tab
                ? "border-[#008080] bg-[#f0fffe] text-[#008080]"
                : "border-[#e0e0e0] text-[#666]"
            )}
          >
            {tab === "business" ? "Business Info" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={onSave}>
        <Field label="Store name">
          <input
            value={values.name}
            onChange={(e) => onChange({ ...values, name: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Category">
          <input
            value={values.category}
            onChange={(e) => onChange({ ...values, category: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Description" className="md:col-span-2">
          <textarea
            value={values.description}
            onChange={(e) => onChange({ ...values, description: e.target.value })}
            rows={4}
            className={inputClass}
          />
        </Field>
        <Field label="Email">
          <input
            value={values.email}
            onChange={(e) => onChange({ ...values, email: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Phone">
          <input
            value={values.phone}
            onChange={(e) => onChange({ ...values, phone: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Website">
          <input
            value={values.website}
            onChange={(e) => onChange({ ...values, website: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Status">
          <select
            value={values.status}
            onChange={(e) => onChange({ ...values, status: e.target.value })}
            className={inputClass}
          >
            <option>Active</option>
            <option>Paused</option>
          </select>
        </Field>
        <Field label="Timezone">
          <input
            value={values.timezone}
            onChange={(e) => onChange({ ...values, timezone: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Currency">
          <select
            value={values.currency}
            onChange={(e) => onChange({ ...values, currency: e.target.value })}
            className={inputClass}
          >
            <option>USD</option>
            <option>NGN</option>
            <option>EUR</option>
          </select>
        </Field>
        <div className="flex flex-wrap justify-between gap-2 pt-2 md:col-span-2">
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg bg-[#e74c3c] px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-[#c0392b]"
          >
            Delete Store
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-[#e0e0e0] bg-[#f0f0f0] px-4 py-2 text-sm font-semibold text-[#1a1a1a]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-[#0a6d6d]"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

function Analytics({
  analytics,
  range,
  onRangeChange
}: {
  analytics: AnalyticsData;
  range: TimeRange;
  onRangeChange: (value: TimeRange) => void;
}) {
  const maxSales = Math.max(...analytics.salesTrend.map((item) => item.value), 1);
  const linePoints = analytics.salesTrend
    .map((item, index) => `${40 + index * 120},${220 - (item.value / maxSales) * 160}`)
    .join(" ");

  const maxOrders = Math.max(...analytics.orderVolume.map((item) => item.value), 1);

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[24px] font-bold">Analytics</h2>
          <div className="flex gap-2">
            {(["7d", "30d", "90d"] as TimeRange[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onRangeChange(item)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-semibold",
                  range === item
                    ? "border-[#008080] bg-[#f0fffe] text-[#008080]"
                    : "border-[#e0e0e0] text-[#666]"
                )}
              >
                {item === "7d" ? "7 days" : item === "30d" ? "30 days" : "90 days"}
              </button>
            ))}
            <button
              type="button"
              className="rounded-lg border border-[#008080] px-3 py-1.5 text-xs font-semibold text-[#008080] hover:bg-[#f0fffe]"
            >
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <h3 className="text-[18px] font-bold">Sales trend</h3>
          <div className="mt-3 overflow-x-auto">
            <svg viewBox="0 0 760 260" className="h-64 w-full min-w-[760px]">
              <defs>
                <linearGradient id="salesTrendGradient" x1="0%" x2="100%">
                  <stop offset="0%" stopColor="#008080" />
                  <stop offset="100%" stopColor="#2dd4bf" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3, 4].map((line) => (
                <line
                  key={line}
                  x1="40"
                  y1={40 + line * 40}
                  x2="720"
                  y2={40 + line * 40}
                  stroke="#efefef"
                />
              ))}
              <polyline
                fill="none"
                stroke="url(#salesTrendGradient)"
                strokeWidth="4"
                points={linePoints}
              />
            </svg>
          </div>
        </article>

        <article className="rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <h3 className="text-[18px] font-bold">Order volume</h3>
          <div className="mt-3 grid grid-cols-6 items-end gap-2">
            {analytics.orderVolume.map((bar) => (
              <div key={bar.label} className="text-center">
                <div className="mx-auto h-44 w-8 rounded-t-lg bg-[#e7f8f7]">
                  <div
                    className="w-8 rounded-t-lg bg-[#008080] transition-all duration-300"
                    style={{
                      height: `${(bar.value / maxOrders) * 176}px`,
                      marginTop: `${176 - (bar.value / maxOrders) * 176}px`
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-[#999]">{bar.label}</p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <h3 className="text-[18px] font-bold">Traffic sources</h3>
          <ul className="mt-3 space-y-2">
            {analytics.trafficSources.map((source) => (
              <li key={source.label} className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: source.color }}
                  />
                  {source.label}
                </span>
                <span className="font-semibold">{source.value}%</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <h3 className="text-[18px] font-bold">Top products</h3>
          <table className="mt-3 w-full text-left text-sm">
            <thead>
              <tr className="text-[#999]">
                <th className="py-2">Product</th>
                <th className="py-2">Orders</th>
                <th className="py-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topProducts.map((row) => (
                <tr key={row.name} className="border-t border-[#efefef]">
                  <td className="py-2">{row.name}</td>
                  <td className="py-2">{row.orders}</td>
                  <td className="py-2">{row.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </div>
    </section>
  );
}

function ReviewsList({
  reviews,
  total,
  search,
  onSearch,
  sort,
  onSort,
  page,
  onPageChange
}: {
  reviews: Review[];
  total: number;
  search: string;
  onSearch: (value: string) => void;
  sort: "latest" | "highest" | "lowest";
  onSort: (value: "latest" | "highest" | "lowest") => void;
  page: number;
  onPageChange: (value: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / 10));
  return (
    <section className="rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search by keyword"
          className={`${inputClass} max-w-xs`}
        />
        <select
          value={sort}
          onChange={(event) => onSort(event.target.value as "latest" | "highest" | "lowest")}
          className={`${inputClass} max-w-[180px]`}
        >
          <option value="latest">Latest</option>
          <option value="highest">Highest rating</option>
          <option value="lowest">Lowest rating</option>
        </select>
      </div>

      <div className="mt-4 space-y-3">
        {reviews.map((review) => (
          <article key={review.id} className="rounded-lg border border-[#e0e0e0] p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Image
                  src={review.avatar}
                  alt={review.customer}
                  width={32}
                  height={32}
                  unoptimized
                  className="rounded-full"
                />
                <div>
                  <p className="text-sm font-semibold">{review.customer}</p>
                  <p className="text-xs text-[#999]">{review.date}</p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-lg border border-[#008080] px-2 py-1 text-xs font-semibold text-[#008080] hover:bg-[#f0fffe]"
              >
                Reply
              </button>
            </div>
            <p className="mt-2 text-sm text-[#666]">{review.text}</p>
          </article>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <p className="text-[#666]">
          Showing page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            className="rounded-lg border border-[#e0e0e0] px-3 py-1.5"
            disabled={page === 1}
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            className="rounded-lg border border-[#e0e0e0] px-3 py-1.5"
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

function EditStoreModal({
  open,
  values,
  onChange,
  onClose,
  onSubmit
}: {
  open: boolean;
  values: SettingsValues;
  onChange: (value: SettingsValues) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[24px] font-bold text-[#1a1a1a]">Edit Store Details</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[#666] hover:bg-[#f5f5f5]"
          >
            <MdClose size={20} />
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Name">
            <input
              value={values.name}
              onChange={(e) => onChange({ ...values, name: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Category">
            <input
              value={values.category}
              onChange={(e) => onChange({ ...values, category: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Description" className="md:col-span-2">
            <textarea
              value={values.description}
              onChange={(e) => onChange({ ...values, description: e.target.value })}
              rows={3}
              className={inputClass}
            />
          </Field>
          <Field label="Email">
            <input
              value={values.email}
              onChange={(e) => onChange({ ...values, email: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Phone">
            <input
              value={values.phone}
              onChange={(e) => onChange({ ...values, phone: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Location">
            <input value="Lagos, Nigeria" readOnly className={`${inputClass} bg-[#f9f9f9]`} />
          </Field>
          <Field label="Website">
            <input
              value={values.website}
              onChange={(e) => onChange({ ...values, website: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Social links" className="md:col-span-2">
            <input
              value="facebook.com/acmestore, instagram.com/acmestore"
              readOnly
              className={`${inputClass} bg-[#f9f9f9]`}
            />
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#e0e0e0] bg-[#f0f0f0] px-4 py-2 text-sm font-semibold text-[#1a1a1a]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0a6d6d]"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

function DeleteStoreDialog({
  open,
  onClose,
  onConfirm
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fdecea] text-[#e74c3c]">
          <MdWarning size={28} />
        </div>
        <h3 className="mt-4 text-center text-[24px] font-bold text-[#e74c3c]">Delete Store?</h3>
        <p className="mt-2 text-center text-[16px] text-[#666]">
          Are you sure? This action cannot be undone.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#e0e0e0] bg-[#f0f0f0] px-4 py-2 text-sm font-semibold text-[#1a1a1a]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-[#e74c3c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c0392b]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  className,
  children
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block text-sm text-[#1a1a1a]", className)}>
      <span className="mb-1 block text-xs text-[#999]">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-sm text-[#1a1a1a] transition focus:border-[#008080] focus:outline-none";
