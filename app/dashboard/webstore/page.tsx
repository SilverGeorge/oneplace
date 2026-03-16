"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  MdAdd,
  MdAnalytics,
  MdArrowDownward,
  MdArrowUpward,
  MdCheckCircle,
  MdClose,
  MdContentCopy,
  MdDomain,
  MdDragIndicator,
  MdEdit,
  MdLanguage,
  MdMenu,
  MdPublic,
  MdSettings,
  MdTimeline
} from "react-icons/md";
import { cn } from "@/lib/cn";
import { SidebarMenu, withPreviewParam } from "@/components/dashboard/SidebarMenu";

type Tab = "overview" | "design" | "pages" | "navigation" | "domains" | "settings";

type Theme = {
  id: string;
  name: string;
  description: string;
};

type WebPage = {
  id: string;
  title: string;
  slug: string;
  status: "Published" | "Draft" | "Hidden";
  metaTitle: string;
  metaDescription: string;
  content: string;
};

type MenuItem = {
  id: string;
  label: string;
  type: "Page" | "Category" | "URL";
  parentId: string | null;
};

const themes: Theme[] = [
  {
    id: "minimal",
    name: "Minimal Commerce",
    description: "Clean cards and whitespace-first layout"
  },
  { id: "modern", name: "Modern Grid", description: "Bold product grid with visual hierarchy" },
  { id: "boutique", name: "Boutique", description: "Fashion-focused hero and editorial sections" },
  { id: "market", name: "Marketplace", description: "Multi-vendor homepage and category rails" },
  { id: "studio", name: "Studio", description: "Creative portfolio look for premium products" },
  { id: "tech", name: "Tech Catalog", description: "Spec-centric cards and comparison friendly" },
  {
    id: "classic",
    name: "Classic Shop",
    description: "Traditional storefront with trusted layout"
  },
  { id: "food", name: "Food Delivery", description: "Quick-order optimized category flow" },
  { id: "service", name: "Service Store", description: "Booking-friendly template for services" },
  { id: "premium", name: "Premium Luxe", description: "High-end styling with strong branding" }
];

const presets = [
  ["Home", "Shop", "Categories", "About", "Contact"],
  ["Home", "New Arrivals", "Best Sellers", "FAQ", "Support"],
  ["Home", "Services", "Pricing", "Testimonials", "Contact"]
];

export default function WebstorePage() {
  const pathname = usePathname() ?? "/dashboard/webstore";
  const searchParams = useSearchParams();
  const isPreviewMode = searchParams?.get("preview") === "1";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [themeId, setThemeId] = useState("modern");
  const [primaryColor, setPrimaryColor] = useState("#008080");
  const [secondaryColor, setSecondaryColor] = useState("#ffc300");
  const [textColor, setTextColor] = useState("#1a1a1a");
  const [fontFamily, setFontFamily] = useState("Plus Jakarta Sans");
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [layout, setLayout] = useState("Product Grid");
  const [footerText, setFooterText] = useState("Built with One Place");
  const [footerLinks, setFooterLinks] = useState("Privacy, Terms, Contact");

  const [pages, setPages] = useState<WebPage[]>([
    {
      id: "pg-about",
      title: "About Us",
      slug: "about",
      status: "Published",
      metaTitle: "About Our Store",
      metaDescription: "Learn about our brand story and values.",
      content: "This is our story..."
    },
    {
      id: "pg-contact",
      title: "Contact",
      slug: "contact",
      status: "Published",
      metaTitle: "Contact Us",
      metaDescription: "Get in touch with our support team.",
      content: "Contact details and form."
    }
  ]);
  const [editingPage, setEditingPage] = useState<WebPage | null>(null);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: "m1", label: "Home", type: "Page", parentId: null },
    { id: "m2", label: "Shop", type: "Page", parentId: null },
    { id: "m3", label: "Electronics", type: "Category", parentId: "m2" },
    { id: "m4", label: "Contact", type: "Page", parentId: null }
  ]);
  const [newMenuLabel, setNewMenuLabel] = useState("");
  const [newMenuType, setNewMenuType] = useState<"Page" | "Category" | "URL">("Page");
  const [domain, setDomain] = useState("mystore.com");
  const [domainVerified, setDomainVerified] = useState(false);
  const [sslEnabled, setSslEnabled] = useState(false);
  const [emailForwarding, setEmailForwarding] = useState("hello@mystore.com");
  const [multiDomain, setMultiDomain] = useState<string[]>(["shop.mystore.com"]);

  const [storeName, setStoreName] = useState("Jon Smith Electronics");
  const [storeDescription, setStoreDescription] = useState(
    "Premium electronics, accessories and support."
  );
  const [contactEmail, setContactEmail] = useState("support@mystore.com");
  const [contactPhone, setContactPhone] = useState("+1 (555) 123-4567");
  const [language, setLanguage] = useState("English");
  const [currency, setCurrency] = useState("USD");
  const [featureReviews, setFeatureReviews] = useState(true);
  const [featureWishlist, setFeatureWishlist] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [visibility, setVisibility] = useState("Public");
  const [gaId, setGaId] = useState("");
  const [fbPixel, setFbPixel] = useState("");

  const selectedTheme = useMemo(
    () => themes.find((item) => item.id === themeId) ?? themes[1],
    [themeId]
  );

  function notify(type: "success" | "error", text: string) {
    setToast({ type, text });
    window.setTimeout(() => setToast(null), 2800);
  }

  function saveDesign() {
    notify("success", "Store design updated successfully");
  }

  function saveSettings() {
    if (!storeName.trim() || !contactEmail.trim()) {
      notify("error", "Store name and contact email are required");
      return;
    }
    notify("success", "Store settings saved");
  }

  function addPage() {
    const draft: WebPage = {
      id: `pg-${Date.now()}`,
      title: "New Page",
      slug: "new-page",
      status: "Draft",
      metaTitle: "",
      metaDescription: "",
      content: ""
    };
    setPages((prev) => [draft, ...prev]);
    setEditingPage(draft);
  }

  function savePage(page: WebPage) {
    if (!page.title.trim() || !page.slug.trim()) {
      notify("error", "Page title and slug are required");
      return;
    }
    setPages((prev) => prev.map((item) => (item.id === page.id ? page : item)));
    setEditingPage(null);
    notify("success", "Page updated");
  }

  function addMenuItem() {
    if (!newMenuLabel.trim()) {
      notify("error", "Menu label is required");
      return;
    }
    setMenuItems((prev) => [
      ...prev,
      { id: `m-${Date.now()}`, label: newMenuLabel.trim(), type: newMenuType, parentId: null }
    ]);
    setNewMenuLabel("");
    notify("success", "Menu item added");
  }

  function moveItem(index: number, direction: "up" | "down") {
    setMenuItems((prev) => {
      const next = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function applyPreset(index: number) {
    const preset = presets[index];
    setMenuItems(
      preset.map((label, i) => ({
        id: `preset-${index}-${i}`,
        label,
        type: "Page",
        parentId: null
      }))
    );
    notify("success", "Menu preset applied");
  }

  function verifyDomain() {
    if (!domain.includes(".")) {
      notify("error", "Enter a valid domain");
      return;
    }
    setDomainVerified(true);
    setSslEnabled(true);
    notify("success", "Domain verified and SSL enabled");
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
            aria-label="Open menu"
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
            &gt; Webstore
          </nav>
          <h1 className="mt-2 text-[40px] font-bold text-[#008080]">Webstore</h1>
          <p className="text-sm text-[#666]">
            Build, customize, and publish your storefront experience
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { id: "overview", label: "Overview" },
              { id: "design", label: "Store Design" },
              { id: "pages", label: "Pages" },
              { id: "navigation", label: "Navigation" },
              { id: "domains", label: "Domains" },
              { id: "settings", label: "Settings" }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id as Tab)}
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

          <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {tab === "overview" ? (
                <section className="animate-form-fade space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <StatCard label="Store Views" value="32,840" icon={<MdTimeline size={20} />} />
                    <StatCard label="Sales" value="$24,550" icon={<MdAnalytics size={20} />} />
                    <StatCard
                      label="Conversion Rate"
                      value="3.4%"
                      icon={<MdCheckCircle size={20} />}
                    />
                  </div>
                  <div className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm">
                    <h2 className="text-lg font-bold text-[#1a1a1a]">Store Status</h2>
                    <p className="mt-1 text-sm text-[#666]">
                      Status: <span className="font-semibold text-[#27ae60]">Online</span>
                    </p>
                    <p className="text-sm text-[#666]">
                      URL:{" "}
                      <a
                        href="https://storefront.com/stores/jon-smith-electronics"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#008080] hover:underline"
                      >
                        storefront.com/stores/jon-smith-electronics
                      </a>
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-lg bg-[#008080] px-3 py-2 text-sm font-semibold text-white"
                      >
                        Publish Changes
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm font-semibold text-[#333]"
                      >
                        Open Store
                      </button>
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm">
                    <h2 className="text-lg font-bold text-[#1a1a1a]">Recent Activity</h2>
                    <ul className="mt-3 space-y-3 text-sm">
                      {[
                        "Theme changed to Modern Grid • 2h ago",
                        "Home page updated and published • 5h ago",
                        "Navigation menu reordered • Yesterday"
                      ].map((line) => (
                        <li key={line} className="rounded-lg bg-[#f8fffe] px-3 py-2 text-[#666]">
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm">
                    <h2 className="text-lg font-bold text-[#1a1a1a]">Performance</h2>
                    <div className="mt-3 space-y-2">
                      <Bar label="Page Speed" value={82} />
                      <Bar label="SEO Score" value={76} />
                      <Bar label="Accessibility" value={91} />
                    </div>
                  </div>
                </section>
              ) : null}

              {tab === "design" ? (
                <section className="animate-form-fade space-y-4">
                  <div className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm">
                    <h2 className="text-[28px] font-bold text-[#1a1a1a]">Theme Selection</h2>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {themes.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setThemeId(item.id)}
                          className={cn(
                            "rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow",
                            themeId === item.id
                              ? "border-[#008080] bg-[#f0fffe]"
                              : "border-[#e0e0e0]"
                          )}
                        >
                          <p className="font-semibold text-[#1a1a1a]">{item.name}</p>
                          <p className="text-xs text-[#666]">{item.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm">
                    <h2 className="text-lg font-bold text-[#1a1a1a]">Color & Typography</h2>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <Field label="Primary color">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="h-10 w-full rounded-lg border border-[#e0e0e0]"
                        />
                      </Field>
                      <Field label="Secondary color">
                        <input
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="h-10 w-full rounded-lg border border-[#e0e0e0]"
                        />
                      </Field>
                      <Field label="Text color">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="h-10 w-full rounded-lg border border-[#e0e0e0]"
                        />
                      </Field>
                      <Field label="Font family">
                        <select
                          value={fontFamily}
                          onChange={(e) => setFontFamily(e.target.value)}
                          className={inputClass}
                        >
                          {["Plus Jakarta Sans", "Inter", "Poppins", "Montserrat"].map((item) => (
                            <option key={item}>{item}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Font size">
                        <input
                          type="number"
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Line height">
                        <input
                          type="number"
                          step="0.1"
                          value={lineHeight}
                          onChange={(e) => setLineHeight(Number(e.target.value))}
                          className={inputClass}
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm">
                    <h2 className="text-lg font-bold text-[#1a1a1a]">Layout & Footer</h2>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <Field label="Layout option">
                        <select
                          value={layout}
                          onChange={(e) => setLayout(e.target.value)}
                          className={inputClass}
                        >
                          {["Full Width", "Sidebar", "Product Grid"].map((item) => (
                            <option key={item}>{item}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Footer text">
                        <input
                          value={footerText}
                          onChange={(e) => setFooterText(e.target.value)}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Footer links" className="md:col-span-2">
                        <input
                          value={footerLinks}
                          onChange={(e) => setFooterLinks(e.target.value)}
                          className={inputClass}
                        />
                      </Field>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={saveDesign}
                        className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
                      >
                        Save Design
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-[#e0e0e0] px-4 py-2 text-sm font-semibold text-[#333]"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </section>
              ) : null}

              {tab === "pages" ? (
                <section className="animate-form-fade space-y-4">
                  <div className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h2 className="text-[28px] font-bold text-[#1a1a1a]">Pages</h2>
                        <p className="text-sm text-[#666]">
                          Create custom pages with SEO and publish control
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={addPage}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#008080] px-3 py-2 text-sm font-semibold text-white"
                      >
                        <MdAdd size={18} /> Create Page
                      </button>
                    </div>
                    <div className="mt-3 space-y-2">
                      {pages.map((page) => (
                        <div key={page.id} className="rounded-lg border border-[#e0e0e0] p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="font-semibold text-[#1a1a1a]">{page.title}</p>
                              <p className="text-xs text-[#666]">/{page.slug}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "rounded-full px-2 py-1 text-xs font-semibold",
                                  page.status === "Published" && "bg-[#eafaf1] text-[#27ae60]",
                                  page.status === "Draft" && "bg-[#dbeafe] text-[#1d4ed8]",
                                  page.status === "Hidden" && "bg-[#f3f4f6] text-[#374151]"
                                )}
                              >
                                {page.status}
                              </span>
                              <button
                                type="button"
                                onClick={() => setEditingPage(page)}
                                className="rounded p-2 text-[#008080] hover:bg-[#e6fbf9]"
                                aria-label={`Edit ${page.title}`}
                              >
                                <MdEdit size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {editingPage ? (
                    <PageEditor
                      page={editingPage}
                      onClose={() => setEditingPage(null)}
                      onSave={savePage}
                    />
                  ) : null}
                </section>
              ) : null}

              {tab === "navigation" ? (
                <section className="animate-form-fade space-y-4">
                  <div className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm">
                    <h2 className="text-[28px] font-bold text-[#1a1a1a]">Navigation</h2>
                    <p className="text-sm text-[#666]">
                      Visual menu editor with hierarchy and presets
                    </p>
                    <div className="mt-3 grid gap-2 md:grid-cols-3">
                      <input
                        value={newMenuLabel}
                        onChange={(e) => setNewMenuLabel(e.target.value)}
                        className={inputClass}
                        placeholder="Menu label"
                      />
                      <select
                        value={newMenuType}
                        onChange={(e) =>
                          setNewMenuType(e.target.value as "Page" | "Category" | "URL")
                        }
                        className={inputClass}
                      >
                        <option>Page</option>
                        <option>Category</option>
                        <option>URL</option>
                      </select>
                      <button
                        type="button"
                        onClick={addMenuItem}
                        className="rounded-lg bg-[#008080] px-3 py-2 text-sm font-semibold text-white"
                      >
                        Add Menu Item
                      </button>
                    </div>
                    <div className="mt-3 space-y-2">
                      {menuItems.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-lg border border-[#e0e0e0] bg-white px-3 py-2"
                        >
                          <div className="inline-flex items-center gap-2">
                            <MdDragIndicator size={18} className="text-[#999]" />
                            <span className="font-semibold text-[#1a1a1a]">{item.label}</span>
                            <span className="text-xs text-[#666]">({item.type})</span>
                            {item.parentId ? (
                              <span className="text-xs text-[#666]">child item</span>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveItem(index, "up")}
                              className="rounded p-1.5 text-[#008080] hover:bg-[#e6fbf9]"
                            >
                              <MdArrowUpward size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveItem(index, "down")}
                              className="rounded p-1.5 text-[#008080] hover:bg-[#e6fbf9]"
                            >
                              <MdArrowDownward size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setMenuItems((prev) => prev.filter((x) => x.id !== item.id))
                              }
                              className="rounded p-1.5 text-[#e74c3c] hover:bg-[#fdecea]"
                            >
                              <MdClose size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-[#1a1a1a]">Menu Presets</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {presets.map((preset, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => applyPreset(index)}
                            className="rounded-lg border border-[#e0e0e0] px-3 py-2 text-xs text-[#333] hover:bg-[#f8fffe]"
                          >
                            {preset.join(" • ")}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              ) : null}

              {tab === "domains" ? (
                <section className="animate-form-fade space-y-4">
                  <div className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm">
                    <h2 className="text-[28px] font-bold text-[#1a1a1a]">Domains</h2>
                    <p className="text-sm text-[#666]">
                      Connect custom domains with SSL and verification
                    </p>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <Field label="Custom domain">
                        <input
                          value={domain}
                          onChange={(e) => setDomain(e.target.value)}
                          className={inputClass}
                          placeholder="mystore.com"
                        />
                      </Field>
                      <Field label="Email forwarding">
                        <input
                          value={emailForwarding}
                          onChange={(e) => setEmailForwarding(e.target.value)}
                          className={inputClass}
                        />
                      </Field>
                    </div>
                    <div className="mt-3 rounded-lg bg-[#f8fffe] p-3 text-sm text-[#666]">
                      <p className="font-semibold text-[#1a1a1a]">DNS Configuration Guide</p>
                      <p className="mt-1">1) Add A record to `76.76.21.21`</p>
                      <p>2) Add CNAME for `www` to `storefront.com`</p>
                      <p>3) Wait for propagation and verify</p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={verifyDomain}
                        className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
                      >
                        Verify Domain
                      </button>
                      <button
                        type="button"
                        onClick={() => setSslEnabled((v) => !v)}
                        className="rounded-lg border border-[#e0e0e0] px-4 py-2 text-sm font-semibold text-[#333]"
                      >
                        Toggle SSL
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setMultiDomain((prev) => [...prev, `alt${prev.length + 1}.mystore.com`])
                        }
                        className="rounded-lg border border-[#e0e0e0] px-4 py-2 text-sm font-semibold text-[#333]"
                      >
                        Add Domain
                      </button>
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      <p>
                        Verification:{" "}
                        {domainVerified ? (
                          <span className="font-semibold text-[#27ae60]">Verified</span>
                        ) : (
                          <span className="font-semibold text-[#e74c3c]">Pending</span>
                        )}
                      </p>
                      <p>
                        SSL Certificate:{" "}
                        {sslEnabled ? (
                          <span className="font-semibold text-[#27ae60]">Active</span>
                        ) : (
                          <span className="font-semibold text-[#e74c3c]">Inactive</span>
                        )}
                      </p>
                      <p>Additional domains: {multiDomain.join(", ")}</p>
                    </div>
                  </div>
                </section>
              ) : null}

              {tab === "settings" ? (
                <section className="animate-form-fade space-y-4">
                  <div className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm">
                    <h2 className="text-[28px] font-bold text-[#1a1a1a]">Store Settings</h2>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <Field label="Store Name *">
                        <input
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Contact Email *">
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Contact Phone">
                        <input
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Language">
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className={inputClass}
                        >
                          {["English", "French", "Spanish"].map((item) => (
                            <option key={item}>{item}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Currency">
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className={inputClass}
                        >
                          {["USD", "EUR", "GBP", "NGN"].map((item) => (
                            <option key={item}>{item}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Store Visibility">
                        <select
                          value={visibility}
                          onChange={(e) => setVisibility(e.target.value)}
                          className={inputClass}
                        >
                          {["Public", "Private", "Password Protected"].map((item) => (
                            <option key={item}>{item}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Store Description" className="md:col-span-2">
                        <textarea
                          value={storeDescription}
                          onChange={(e) => setStoreDescription(e.target.value)}
                          rows={3}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Google Analytics ID">
                        <input
                          value={gaId}
                          onChange={(e) => setGaId(e.target.value)}
                          className={inputClass}
                          placeholder="G-XXXXXXXXXX"
                        />
                      </Field>
                      <Field label="Facebook Pixel ID">
                        <input
                          value={fbPixel}
                          onChange={(e) => setFbPixel(e.target.value)}
                          className={inputClass}
                          placeholder="1234567890"
                        />
                      </Field>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <Toggle
                        label="Enable Reviews & Ratings"
                        checked={featureReviews}
                        onChange={setFeatureReviews}
                      />
                      <Toggle
                        label="Enable Wishlist"
                        checked={featureWishlist}
                        onChange={setFeatureWishlist}
                      />
                      <Toggle
                        label="Maintenance Mode"
                        checked={maintenanceMode}
                        onChange={setMaintenanceMode}
                      />
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={saveSettings}
                        className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
                      >
                        Save Settings
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-[#e0e0e0] px-4 py-2 text-sm font-semibold text-[#333]"
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                </section>
              ) : null}
            </div>

            <aside className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#666]">
                Real-time Preview
              </h2>
              <div className="mt-3 rounded-xl border border-[#e0e0e0] p-3">
                <div className="h-10 rounded-lg" style={{ backgroundColor: primaryColor }} />
                <p className="mt-2 text-sm font-bold" style={{ color: textColor, fontFamily }}>
                  {storeName}
                </p>
                <p className="text-xs text-[#666]" style={{ lineHeight }}>
                  Theme: {selectedTheme.name} • Layout: {layout}
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="h-16 rounded bg-[#f5f5f5]" />
                  <div className="h-16 rounded" style={{ backgroundColor: secondaryColor }} />
                  <div className="h-16 rounded bg-[#f5f5f5]" />
                </div>
                <div
                  className="mt-3 rounded-lg p-2 text-xs text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  CTA Button Preview
                </div>
                <div className="mt-3 rounded-lg bg-[#f8fffe] p-2 text-xs text-[#666]">
                  Footer: {footerText}
                  <br />
                  Links: {footerLinks}
                </div>
                <button
                  type="button"
                  className="mt-3 w-full rounded-lg border border-[#008080] px-3 py-2 text-sm font-semibold text-[#008080]"
                >
                  Preview Storefront
                </button>
              </div>

              <div className="mt-4 rounded-lg border border-[#e0e0e0] p-3 text-xs text-[#666]">
                <p className="font-semibold text-[#1a1a1a]">Quick Actions</p>
                <div className="mt-2 space-y-2">
                  <button
                    type="button"
                    className="w-full rounded border border-[#e0e0e0] px-3 py-2 text-left hover:bg-[#f8fffe]"
                  >
                    <MdPublic size={14} className="mr-1 inline" />
                    Open Live Store
                  </button>
                  <button
                    type="button"
                    className="w-full rounded border border-[#e0e0e0] px-3 py-2 text-left hover:bg-[#f8fffe]"
                  >
                    <MdDomain size={14} className="mr-1 inline" />
                    Manage Domain
                  </button>
                  <button
                    type="button"
                    className="w-full rounded border border-[#e0e0e0] px-3 py-2 text-left hover:bg-[#f8fffe]"
                  >
                    <MdSettings size={14} className="mr-1 inline" />
                    Advanced Settings
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {toast ? (
        <div
          className={cn(
            "fixed right-4 top-4 z-[80] rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-lg",
            toast.type === "success" ? "bg-[#27ae60]" : "bg-[#e74c3c]"
          )}
        >
          {toast.text}
        </div>
      ) : null}
    </main>
  );
}

function PageEditor({
  page,
  onClose,
  onSave
}: {
  page: WebPage;
  onClose: () => void;
  onSave: (page: WebPage) => void;
}) {
  const [draft, setDraft] = useState(page);
  return (
    <div className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#1a1a1a]">Edit Page</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-[#666] hover:bg-[#f5f5f5]"
        >
          <MdClose size={18} />
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Page Title">
          <input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Slug">
          <input
            value={draft.slug}
            onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Meta Title">
          <input
            value={draft.metaTitle}
            onChange={(e) => setDraft({ ...draft, metaTitle: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Status">
          <select
            value={draft.status}
            onChange={(e) => setDraft({ ...draft, status: e.target.value as WebPage["status"] })}
            className={inputClass}
          >
            <option>Published</option>
            <option>Draft</option>
            <option>Hidden</option>
          </select>
        </Field>
        <Field label="Meta Description" className="md:col-span-2">
          <textarea
            value={draft.metaDescription}
            onChange={(e) => setDraft({ ...draft, metaDescription: e.target.value })}
            rows={2}
            className={inputClass}
          />
        </Field>
        <Field label="Page Content" className="md:col-span-2">
          <div className="mb-1 flex gap-1 text-xs">
            {["Bold", "Italic", "Underline", "Link", "List", "CTA", "Gallery"].map((tool) => (
              <button
                key={tool}
                type="button"
                className="rounded border border-[#e0e0e0] px-2 py-1"
              >
                {tool}
              </button>
            ))}
          </div>
          <textarea
            value={draft.content}
            onChange={(e) => setDraft({ ...draft, content: e.target.value })}
            rows={6}
            className={inputClass}
          />
        </Field>
      </div>
      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          className="rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm font-semibold text-[#333]"
        >
          Preview
        </button>
        <button
          type="button"
          className="rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm font-semibold text-[#333]"
        >
          Save Draft
        </button>
        <button
          type="button"
          onClick={() => onSave(draft)}
          className="rounded-lg bg-[#008080] px-3 py-2 text-sm font-semibold text-white"
        >
          Publish
        </button>
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="inline-flex items-center justify-between rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm">
      <span>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition",
          checked ? "bg-[#008080]" : "bg-[#d1d5db]"
        )}
        aria-label={label}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </label>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <article className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-[#666]">{label}</p>
        <span className="text-[#008080]">{icon}</span>
      </div>
      <p className="mt-1 text-2xl font-bold text-[#1a1a1a]">{value}</p>
    </article>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-[#666]">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-[#f0f0f0]">
        <div className="h-2 rounded-full bg-[#008080]" style={{ width: `${value}%` }} />
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
    <label className={cn("block text-sm", className)}>
      <span className="mb-1 block text-xs font-bold text-[#333]">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-sm text-[#1a1a1a] transition focus:border-[#008080] focus:outline-none";
