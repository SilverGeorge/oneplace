"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  MdCheckCircle,
  MdClose,
  MdCompareArrows,
  MdFilterAlt,
  MdMenu,
  MdPalette,
  MdPreview
} from "react-icons/md";
import { cn } from "@/lib/cn";
import { SidebarMenu, withPreviewParam } from "@/components/dashboard/SidebarMenu";
import { usePreviewMode } from "@/hooks/use-preview-mode";
import { STOREFRONT_TEMPLATE_CONFIG_KEY, storefrontTemplates } from "@/lib/storefront-templates";

type TemplateTab = "all" | "mine" | "recent";
type TemplateItem = {
  id: string;
  name: string;
  category: string;
  image: string;
  features: string[];
  rating: number;
  price: "Free" | `$${number}`;
  active?: boolean;
  used?: boolean;
  recent?: boolean;
};

const templateItems: TemplateItem[] = storefrontTemplates.map((template, index) => ({
  id: template.id,
  name: template.name,
  category: template.category,
  image: template.image,
  features: template.features,
  rating: template.rating,
  price: template.badge === "FREE" ? "Free" : `$${29 + index * 10}`,
  used: index < 6,
  recent: index < 4
}));

export default function TemplatesDashboardPage() {
  const pathname = usePathname() ?? "/dashboard/templates";
  const isPreviewMode = usePreviewMode();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tab, setTab] = useState<TemplateTab>("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Top Rated");
  const [activeId, setActiveId] = useState(templateItems[0]?.id ?? "minimal-store");
  const [preview, setPreview] = useState<TemplateItem | null>(null);
  const [customize, setCustomize] = useState<TemplateItem | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [colors, setColors] = useState({
    primary: "#008080",
    accent: "#ffc300",
    background: "#f8fffe",
    text: "#1a1a1a"
  });
  const [coverImage, setCoverImage] = useState<string>("");
  const [logoImage, setLogoImage] = useState<string>("");
  const [editableProducts, setEditableProducts] = useState<
    Array<{
      id: string;
      name: string;
      category: string;
      price: number;
      image: string;
    }>
  >([]);

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
    const selected = storefrontTemplates.find((template) => template.id === id);
    if (selected) {
      localStorage.setItem(
        STOREFRONT_TEMPLATE_CONFIG_KEY,
        JSON.stringify({
          templateId: selected.id,
          templateName: selected.name,
          colors: selected.palette
        })
      );
    }
    notify("Template activated successfully");
  }

  function openCustomizer(template: TemplateItem) {
    const raw = localStorage.getItem(STOREFRONT_TEMPLATE_CONFIG_KEY);
    let saved:
      | {
          templateId?: string;
          colors?: typeof colors;
          coverImage?: string;
          logoImage?: string;
          customProducts?: Array<{
            id: string;
            name: string;
            category: string;
            price: number;
            image: string;
          }>;
        }
      | undefined;
    if (raw) {
      try {
        saved = JSON.parse(raw) as typeof saved;
      } catch {
        saved = undefined;
      }
    }
    const selected = storefrontTemplates.find((item) => item.id === template.id);
    const defaultColors = selected?.palette ?? {
      primary: "#008080",
      accent: "#ffc300",
      background: "#f8fffe",
      text: "#1a1a1a"
    };
    const resolvedColors =
      saved?.templateId === template.id && saved.colors ? saved.colors : defaultColors;
    setColors(resolvedColors);
    setCoverImage(saved?.templateId === template.id ? (saved.coverImage ?? "") : "");
    setLogoImage(saved?.templateId === template.id ? (saved.logoImage ?? "") : "");
    setEditableProducts(saved?.templateId === template.id ? (saved.customProducts ?? []) : []);
    setCustomize(template);
  }

  function readImageAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("Failed to read image"));
      reader.readAsDataURL(file);
    });
  }

  function addEditableProduct() {
    setEditableProducts((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        name: "New Product",
        category: "Custom",
        price: 0,
        image: ""
      }
    ]);
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
                <div className="relative h-40 w-full bg-[#f3f3f3]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
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
                      onClick={() => openCustomizer(item)}
                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#e0e0e0] px-3 py-2 text-xs font-semibold text-[#333]"
                    >
                      <MdPalette size={14} />
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
            <div className="relative h-56 w-full rounded-lg bg-[#f3f3f3]">
              <Image
                src={preview.image}
                alt={`${preview.name} preview`}
                fill
                className="rounded-lg object-cover"
                unoptimized
              />
            </div>
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
                onClick={() => openCustomizer(preview)}
                className="rounded-lg border border-[#e0e0e0] px-4 py-2 text-sm font-semibold text-[#333]"
              >
                Customize Before Activation
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {customize ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-5xl rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-[#1a1a1a]">
                Template Editor • {customize.name}
              </h3>
              <button
                type="button"
                onClick={() => setCustomize(null)}
                className="rounded p-1 hover:bg-[#f5f5f5]"
              >
                <MdClose size={18} />
              </button>
            </div>
            <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
              <div className="space-y-3 rounded-lg border border-[#e0e0e0] p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-[#666]">
                  Theme Colors
                </p>
                <ColorField
                  label="Primary"
                  value={colors.primary}
                  onChange={(value) => setColors((prev) => ({ ...prev, primary: value }))}
                />
                <ColorField
                  label="Accent"
                  value={colors.accent}
                  onChange={(value) => setColors((prev) => ({ ...prev, accent: value }))}
                />
                <ColorField
                  label="Background"
                  value={colors.background}
                  onChange={(value) => setColors((prev) => ({ ...prev, background: value }))}
                />
                <ColorField
                  label="Text"
                  value={colors.text}
                  onChange={(value) => setColors((prev) => ({ ...prev, text: value }))}
                />

                <p className="pt-2 text-xs font-bold uppercase tracking-wide text-[#666]">
                  Branding Images
                </p>
                <label className="block text-xs font-semibold text-[#333]">
                  Cover image
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="mt-1 block w-full text-xs"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      void readImageAsDataUrl(file).then((dataUrl) => setCoverImage(dataUrl));
                    }}
                  />
                </label>
                <label className="block text-xs font-semibold text-[#333]">
                  Logo image
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="mt-1 block w-full text-xs"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      void readImageAsDataUrl(file).then((dataUrl) => setLogoImage(dataUrl));
                    }}
                  />
                </label>
                {coverImage || logoImage ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded border border-[#e0e0e0] p-1">
                      <p className="mb-1 text-[10px] font-semibold text-[#666]">Cover</p>
                      <div className="relative h-16 overflow-hidden rounded bg-[#f5f5f5]">
                        {coverImage ? (
                          <Image
                            src={coverImage}
                            alt="Cover preview"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : null}
                      </div>
                    </div>
                    <div className="rounded border border-[#e0e0e0] p-1">
                      <p className="mb-1 text-[10px] font-semibold text-[#666]">Logo</p>
                      <div className="relative h-16 overflow-hidden rounded bg-[#f5f5f5]">
                        {logoImage ? (
                          <Image
                            src={logoImage}
                            alt="Logo preview"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
              <div
                className="rounded-lg border border-[#e0e0e0] p-4"
                style={{ backgroundColor: colors.background, color: colors.text }}
              >
                <div className="h-10 rounded-lg" style={{ backgroundColor: colors.primary }} />
                <p className="mt-3 text-lg font-bold">Live Template Preview</p>
                <p className="mt-1 text-sm opacity-80">
                  See your selected colors before activation.
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="h-14 rounded bg-white/80" />
                  <div className="h-14 rounded" style={{ backgroundColor: colors.accent }} />
                  <div className="h-14 rounded bg-white/80" />
                </div>
                <button
                  type="button"
                  className="mt-3 rounded-lg px-4 py-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: colors.primary }}
                >
                  Primary CTA
                </button>
                <div className="mt-4 rounded-lg border border-[#e0e0e0] bg-white p-3 text-[#1a1a1a]">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-bold">Editable Products</p>
                    <button
                      type="button"
                      onClick={addEditableProduct}
                      className="rounded border border-[#e0e0e0] px-2 py-1 text-xs font-semibold"
                    >
                      + Add Product
                    </button>
                  </div>
                  <div className="space-y-2">
                    {editableProducts.length === 0 ? (
                      <p className="text-xs text-[#666]">
                        No custom products yet. Add products to override storefront listing.
                      </p>
                    ) : (
                      editableProducts.map((product) => (
                        <div key={product.id} className="rounded border border-[#f0f0f0] p-2">
                          <div className="grid gap-2 sm:grid-cols-2">
                            <input
                              value={product.name}
                              onChange={(event) =>
                                setEditableProducts((prev) =>
                                  prev.map((item) =>
                                    item.id === product.id
                                      ? { ...item, name: event.target.value }
                                      : item
                                  )
                                )
                              }
                              className={inputClass}
                              placeholder="Product name"
                            />
                            <input
                              type="number"
                              value={product.price}
                              onChange={(event) =>
                                setEditableProducts((prev) =>
                                  prev.map((item) =>
                                    item.id === product.id
                                      ? { ...item, price: Number(event.target.value) }
                                      : item
                                  )
                                )
                              }
                              className={inputClass}
                              placeholder="Price"
                            />
                            <input
                              value={product.category}
                              onChange={(event) =>
                                setEditableProducts((prev) =>
                                  prev.map((item) =>
                                    item.id === product.id
                                      ? { ...item, category: event.target.value }
                                      : item
                                  )
                                )
                              }
                              className={inputClass}
                              placeholder="Category"
                            />
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.webp"
                              className="rounded-lg border border-[#e0e0e0] px-3 py-2 text-xs"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (!file) return;
                                void readImageAsDataUrl(file).then((dataUrl) =>
                                  setEditableProducts((prev) =>
                                    prev.map((item) =>
                                      item.id === product.id ? { ...item, image: dataUrl } : item
                                    )
                                  )
                                );
                              }}
                            />
                          </div>
                          <div className="mt-2 flex justify-between">
                            <p className="text-xs text-[#666]">
                              {product.image ? "Image selected" : "No image selected"}
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                setEditableProducts((prev) =>
                                  prev.filter((item) => item.id !== product.id)
                                )
                              }
                              className="text-xs font-semibold text-[#e74c3c]"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCustomize(null)}
                className="rounded-lg border border-[#e0e0e0] px-4 py-2 text-sm font-semibold text-[#333]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const selected = storefrontTemplates.find((item) => item.id === customize.id);
                  localStorage.setItem(
                    STOREFRONT_TEMPLATE_CONFIG_KEY,
                    JSON.stringify({
                      templateId: customize.id,
                      templateName: customize.name,
                      colors,
                      coverImage: coverImage || undefined,
                      logoImage: logoImage || undefined,
                      customProducts: editableProducts.map((product) => ({
                        id: product.id,
                        name: product.name || "Custom Product",
                        category: product.category || "Custom",
                        price: Number.isFinite(product.price) ? product.price : 0,
                        stock: 10,
                        rating: 5,
                        reviews: 0,
                        sold: 0,
                        description: "Customized product from template editor.",
                        image: product.image || "https://picsum.photos/600/420?random=191",
                        variants: {
                          sizes: ["Standard"],
                          colors: ["Default"]
                        }
                      }))
                    })
                  );
                  if (selected) {
                    setActiveId(selected.id);
                  }
                  setCustomize(null);
                  notify("Template changes saved");
                }}
                className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
              >
                Save Template Changes
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

function ColorField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-[#333]">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-12 rounded border border-[#e0e0e0]"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full rounded-lg border border-[#e0e0e0] px-3 text-sm"
        />
      </div>
    </label>
  );
}
