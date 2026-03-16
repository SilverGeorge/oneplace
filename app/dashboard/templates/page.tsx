"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  MdCheckCircle,
  MdClose,
  MdCompareArrows,
  MdFilterAlt,
  MdMenu,
  MdPreview
} from "react-icons/md";
import { cn } from "@/lib/cn";
import { SidebarMenu, withPreviewParam } from "@/components/dashboard/SidebarMenu";
import { usePreviewMode } from "@/hooks/use-preview-mode";

type TemplateTab = "all" | "mine" | "recent";
type TemplateItem = {
  id: string;
  name: string;
  category: string;
  features: string[];
  rating: number;
  price: "Free" | `$${number}`;
  active?: boolean;
  used?: boolean;
  recent?: boolean;
};

const templateItems: TemplateItem[] = [
  {
    id: "t1",
    name: "Minimal Store",
    category: "Retail",
    features: ["Mobile Responsive", "Fast Loading", "Simple Layout"],
    rating: 4.8,
    price: "Free",
    active: true,
    used: true,
    recent: true
  },
  {
    id: "t2",
    name: "Professional Market",
    category: "Marketplace",
    features: ["Vendor Dashboard", "Commission Rules", "Review Modules"],
    rating: 4.9,
    price: "$49",
    used: true,
    recent: true
  },
  {
    id: "t3",
    name: "Fashion Boutique",
    category: "Fashion",
    features: ["Lookbook", "Size Guides", "Trend Banner"],
    rating: 4.7,
    price: "$29"
  },
  {
    id: "t4",
    name: "Tech Showcase",
    category: "Electronics",
    features: ["Spec Table", "Comparison", "Feature Blocks"],
    rating: 4.6,
    price: "Free"
  },
  {
    id: "t5",
    name: "Services Marketplace",
    category: "Services",
    features: ["Bookings", "Availability", "Provider Profiles"],
    rating: 4.5,
    price: "$79",
    recent: true
  }
];

export default function TemplatesDashboardPage() {
  const pathname = usePathname() ?? "/dashboard/templates";
  const isPreviewMode = usePreviewMode();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tab, setTab] = useState<TemplateTab>("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Top Rated");
  const [activeId, setActiveId] = useState("t1");
  const [preview, setPreview] = useState<TemplateItem | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let rows = templateItems.map((item) => ({ ...item, active: item.id === activeId }));
    if (tab === "mine") rows = rows.filter((item) => item.used);
    if (tab === "recent") rows = rows.filter((item) => item.recent);
    rows = rows.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));
    if (category !== "All") rows = rows.filter((item) => item.category === category);
    rows = [...rows].sort((a, b) => {
      if (sort === "Top Rated") return b.rating - a.rating;
      if (sort === "Price: Low to High") {
        const ap = a.price === "Free" ? 0 : Number(a.price.replace("$", ""));
        const bp = b.price === "Free" ? 0 : Number(b.price.replace("$", ""));
        return ap - bp;
      }
      if (sort === "Price: High to Low") {
        const ap = a.price === "Free" ? 0 : Number(a.price.replace("$", ""));
        const bp = b.price === "Free" ? 0 : Number(b.price.replace("$", ""));
        return bp - ap;
      }
      return a.name.localeCompare(b.name);
    });
    return rows;
  }, [tab, query, category, sort, activeId]);

  function notify(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(null), 2200);
  }

  function toggleCompare(id: string) {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id].slice(0, 3)
    );
  }

  function activateTemplate(id: string) {
    setActiveId(id);
    notify("Template activated successfully");
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="flex">
        <SidebarMenu
          pathname={pathname}
          isPreviewMode={isPreviewMode}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <div className="min-w-0 flex-1 p-4 sm:p-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded p-2 text-[#008080] hover:bg-[#f0fffe] md:hidden"
          >
            <MdMenu size={24} />
          </button>

          <nav className="text-sm text-[#666]" aria-label="Breadcrumb">
            <Link
              href={withPreviewParam("/dashboard", isPreviewMode)}
              className="text-[#008080] hover:underline"
            >
              Dashboard
            </Link>{" "}
            &gt; Templates
          </nav>
          <h1 className="mt-2 text-[40px] font-bold text-[#008080]">Templates</h1>
          <p className="text-sm text-[#666]">
            Browse, compare, activate, and customize store templates
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Templates" },
              { id: "mine", label: "My Templates" },
              { id: "recent", label: "Recently Used" }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id as TemplateTab)}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm transition",
                  tab === item.id
                    ? "border-[#008080] bg-[#008080] font-semibold text-white"
                    : "border-[#e0e0e0] text-[#333] hover:bg-[#f0fffe]"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <section className="mt-4 rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm">
            <div className="grid gap-2 md:grid-cols-4">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search templates..."
                className={inputClass}
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              >
                {["All", "Retail", "Marketplace", "Fashion", "Electronics", "Services"].map(
                  (item) => (
                    <option key={item}>{item}</option>
                  )
                )}
              </select>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className={inputClass}>
                {["Top Rated", "Alphabetical", "Price: Low to High", "Price: High to Low"].map(
                  (item) => (
                    <option key={item}>{item}</option>
                  )
                )}
              </select>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm font-semibold text-[#333]"
              >
                <MdFilterAlt size={16} />
                Advanced Filters
              </button>
            </div>
          </section>

          <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-xl border border-[#e0e0e0] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="h-40 bg-gradient-to-br from-[#f0fffe] via-[#e6fbf9] to-[#f9f9f9]" />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-base font-bold text-[#1a1a1a]">{item.name}</h2>
                      <p className="text-xs text-[#666]">{item.category}</p>
                    </div>
                    {item.active ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#eafaf1] px-2 py-1 text-xs font-semibold text-[#27ae60]">
                        <MdCheckCircle size={14} /> Active
                      </span>
                    ) : null}
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-[#666]">
                    {item.features.slice(0, 3).map((f) => (
                      <li key={f}>• {f}</li>
                    ))}
                  </ul>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-[#008080]">{item.price}</span>
                    <span className="text-xs text-[#666]">⭐ {item.rating.toFixed(1)}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPreview(item)}
                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#e0e0e0] px-3 py-2 text-xs font-semibold text-[#333]"
                    >
                      <MdPreview size={14} />
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => activateTemplate(item.id)}
                      className={cn(
                        "rounded-lg px-3 py-2 text-xs font-semibold",
                        item.active ? "bg-[#f0f0f0] text-[#666]" : "bg-[#008080] text-white"
                      )}
                    >
                      {item.active
                        ? "Currently Active"
                        : item.price === "Free"
                          ? "Activate"
                          : "Purchase & Install"}
                    </button>
                    <button
                      type="button"
                      onClick={() => notify("Open customize flow")}
                      className="rounded-lg border border-[#e0e0e0] px-3 py-2 text-xs font-semibold text-[#333]"
                    >
                      Customize
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleCompare(item.id)}
                      className={cn(
                        "inline-flex items-center justify-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold",
                        compareIds.includes(item.id)
                          ? "border-[#008080] bg-[#f0fffe] text-[#008080]"
                          : "border-[#e0e0e0] text-[#333]"
                      )}
                    >
                      <MdCompareArrows size={14} />
                      Compare
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="mt-4 rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wide text-[#666]">
              Template Comparison
            </h3>
            {compareIds.length < 2 ? (
              <p className="mt-2 text-sm text-[#666]">Select at least 2 templates to compare.</p>
            ) : (
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="bg-[#f5f5f5] text-[#333]">
                    <tr>
                      <th className="px-3 py-2">Template</th>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2">Price</th>
                      <th className="px-3 py-2">Rating</th>
                      <th className="px-3 py-2">Features</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templateItems
                      .filter((item) => compareIds.includes(item.id))
                      .map((item) => (
                        <tr key={item.id} className="border-t border-[#f0f0f0]">
                          <td className="px-3 py-2 font-semibold">{item.name}</td>
                          <td className="px-3 py-2">{item.category}</td>
                          <td className="px-3 py-2">{item.price}</td>
                          <td className="px-3 py-2">⭐ {item.rating.toFixed(1)}</td>
                          <td className="px-3 py-2">{item.features.join(", ")}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>

      {preview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-[#1a1a1a]">{preview.name} Preview</h3>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="rounded p-1 hover:bg-[#f5f5f5]"
              >
                <MdClose size={18} />
              </button>
            </div>
            <div className="h-56 rounded-lg bg-gradient-to-br from-[#f0fffe] via-[#e6fbf9] to-[#f9f9f9]" />
            <p className="mt-3 text-sm text-[#666]">{preview.features.join(" • ")}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => activateTemplate(preview.id)}
                className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
              >
                Activate Template
              </button>
              <button
                type="button"
                className="rounded-lg border border-[#e0e0e0] px-4 py-2 text-sm font-semibold text-[#333]"
              >
                Customize Before Activation
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed right-4 top-4 z-[70] rounded-lg bg-[#27ae60] px-4 py-3 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </main>
  );
}

const inputClass =
  "w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-sm text-[#1a1a1a] transition focus:border-[#008080] focus:outline-none";
