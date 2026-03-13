"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

type Template = {
  id: string;
  name: string;
  description: string;
  image: string;
  badge: "FREE" | "PREMIUM" | "POPULAR";
  features: string[];
  category: "Retail" | "Services" | "Food" | "Fashion" | "Tech";
  rating: number;
  users: number;
};

const templates: Template[] = [
  {
    id: "minimal-store",
    name: "Minimal Store",
    description: "Perfect for small businesses and startups",
    image: "/images/template-minimal.jpg",
    features: ["Simple layout", "Fast loading", "Easy navigation"],
    badge: "FREE",
    category: "Retail",
    rating: 4.7,
    users: 1200
  },
  {
    id: "professional-market",
    name: "Professional Market",
    description: "Ideal for multi-vendor marketplaces",
    image: "/images/template-professional.jpg",
    features: ["Vendor dashboard", "Commission management", "Reviews", "Admin controls"],
    badge: "PREMIUM",
    category: "Retail",
    rating: 4.8,
    users: 2500
  },
  {
    id: "fashion-boutique",
    name: "Fashion Boutique",
    description: "Tailored for fashion and lifestyle brands",
    image: "/images/template-fashion.jpg",
    features: ["Image gallery", "Size guides", "Trending products", "Lookbooks"],
    badge: "PREMIUM",
    category: "Fashion",
    rating: 4.9,
    users: 1800
  },
  {
    id: "food-grocery",
    name: "Food & Grocery",
    description: "Perfect for restaurants and grocery stores",
    image: "/images/template-food.jpg",
    features: ["Category browsing", "Quick order", "Delivery tracking", "Order updates"],
    badge: "FREE",
    category: "Food",
    rating: 4.6,
    users: 1400
  },
  {
    id: "tech-electronics",
    name: "Tech & Electronics",
    description: "For tech and electronics retailers",
    image: "/images/template-tech.jpg",
    features: ["Product specs", "Tech reviews", "Comparison tools", "Filter presets"],
    badge: "POPULAR",
    category: "Tech",
    rating: 4.8,
    users: 2500
  },
  {
    id: "services-marketplace",
    name: "Services Marketplace",
    description: "For service providers and freelancers",
    image: "/images/template-services.jpg",
    features: ["Booking system", "Reviews", "Ratings", "Service packages"],
    badge: "PREMIUM",
    category: "Services",
    rating: 4.8,
    users: 2100
  }
];

function badgeStyle(badge: Template["badge"]): string {
  if (badge === "FREE") return "bg-[#27ae60]";
  if (badge === "POPULAR") return "bg-[#e74c3c]";
  return "bg-[#ffc300] text-slate-900";
}

export default function TemplatesSection() {
  const router = useRouter();
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [badgeFilter, setBadgeFilter] = useState<"ALL" | "FREE" | "PREMIUM" | "POPULAR">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | Template["category"]>("ALL");

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const badgeMatch = badgeFilter === "ALL" || template.badge === badgeFilter;
      const categoryMatch = categoryFilter === "ALL" || template.category === categoryFilter;
      return badgeMatch && categoryMatch;
    });
  }, [badgeFilter, categoryFilter]);

  function handleUseTemplate(template: Template): void {
    localStorage.setItem("selected-template", JSON.stringify(template));
    router.push(`/storefront/create?template=${template.id}`);
  }

  return (
    <section className="animate-form-fade bg-[#f1f1f1] py-12 sm:py-14 lg:py-16">
      <div className="container-main">
        <h2 className="text-center text-[40px] font-bold text-[#1a1a1a]">Choose Your Storefront Template</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-[18px] font-normal text-[#666666]">
          Select a template and customize it to match your brand
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
        {(["ALL", "FREE", "PREMIUM", "POPULAR"] as const).map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setBadgeFilter(filter)}
            className={cn(
              "rounded-full border border-[#e0e0e0] px-4 py-2 text-xs font-semibold transition duration-300",
              badgeFilter === filter
                ? "bg-[#008080] text-white"
                : "bg-white text-slate-700 hover:scale-[1.02] hover:border-[#008080] hover:text-[#008080]"
            )}
          >
            {filter}
          </button>
        ))}
        {/* Commented out the "all industries" section
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value as "ALL" | Template["category"])}
          className="rounded-full border border-[#e0e0e0] bg-white px-4 py-2 text-xs font-semibold text-slate-700 focus:border-[#008080] focus:outline-none"
        >
          
          <option value="ALL">All Industries</option>
          <option value="Retail">Retail</option>
          <option value="Services">Services</option>
          <option value="Food">Food</option>
          <option value="Fashion">Fashion</option>
          <option value="Tech">Tech</option>
        </select>
        */}
        </div>
        

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <article
            key={template.id}
            className="group overflow-hidden rounded-2xl border border-[#e0e0e0] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)]"
          >
            <div className="relative h-[220px] w-full bg-[#f0f0f0] lg:h-[280px]">
              {imageErrors[template.id] ? (
                <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
                  Template Preview
                </div>
              ) : (
                <Image
                  src={template.image}
                  alt={template.name}
                  fill
                  unoptimized
                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  onError={() => setImageErrors((prev) => ({ ...prev, [template.id]: true }))}
                />
              )}

              <span
                className={cn(
                  "absolute right-4 top-4 rounded-full px-4 py-2 text-[12px] font-bold text-white animate-pulse",
                  badgeStyle(template.badge)
                )}
              >
                {template.badge}
              </span>
            </div>

            <div className="p-6">
              <h3 className="text-[18px] font-bold text-[#1a1a1a]">{template.name}</h3>
              <p className="mt-3 overflow-hidden text-[14px] font-normal text-[#666666] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                {template.description}
              </p>

              <p className="mt-3 text-xs text-slate-600">
                ★ {template.rating.toFixed(1)} / 5.0 • {(template.users / 1000).toFixed(1)}k+ stores using this template
              </p>

              <ul className="mt-4 space-y-2">
                {template.features.slice(0, 4).map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-[12px] font-normal text-[#1a1a1a]">
                    <span className="inline-flex h-4 w-4 items-center justify-center text-[14px] text-[#008080]">
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={() => handleUseTemplate(template)}
                  className="w-full rounded-lg bg-[#008080] px-6 py-3 text-[14px] font-semibold text-white transition duration-300 hover:scale-[1.02] hover:bg-[#0a6d6d]"
                >
                  Use This Template
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(template)}
                  className="w-full rounded-lg border border-[#008080] bg-transparent px-6 py-3 text-[14px] font-semibold text-[#008080] transition duration-300 hover:bg-[#f0fffe]"
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/storefront/create-account")}
                  className="w-full text-[13px] font-semibold text-[#008080] transition duration-300 hover:underline"
                >
                  Skip this step and choose later
                </button>
              </div>
            </div>
          </article>
        ))}
        </div>

        {/* Commented out the "Can't decide?" section
        <div className="mt-10 rounded-2xl border border-[#e0e0e0] bg-white p-6 text-center shadow-sm">
          <h3 className="text-2xl font-bold text-[#1a1a1a]">Can&apos;t decide? Let us help!</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[#666666]">
            Get personalized template recommendations based on your store type and goals.
          </p>
          <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push("/contact")}
              className="rounded-lg bg-[#008080] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:scale-[1.02] hover:bg-[#0a6d6d]"
            >
              Schedule a consultation
            </button>
            <button
              type="button"
              onClick={() => router.push("/templates")}
              className="rounded-lg border border-[#008080] px-5 py-3 text-sm font-semibold text-[#008080] transition duration-300 hover:bg-[#f0fffe]"
            >
              View full template showcase
            </button>
          </div>
        </div>
        */}

        {previewTemplate ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setPreviewTemplate(null)}
          >
            <div
              className="w-full max-w-3xl rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">{previewTemplate.name}</h3>
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
              <div className="relative h-[260px] w-full overflow-hidden rounded-xl bg-[#f0f0f0] sm:h-[380px]">
                {imageErrors[`preview-${previewTemplate.id}`] ? (
                  <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
                    Preview unavailable
                  </div>
                ) : (
                  <Image
                    src={previewTemplate.image}
                    alt={`${previewTemplate.name} preview`}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={() => setImageErrors((prev) => ({ ...prev, [`preview-${previewTemplate.id}`]: true }))}
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => handleUseTemplate(previewTemplate)}
                className="mt-4 w-full rounded-lg bg-[#008080] px-6 py-3 text-[14px] font-semibold text-white transition duration-300 hover:scale-[1.02] hover:bg-[#0a6d6d]"
              >
                Use This Template
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}