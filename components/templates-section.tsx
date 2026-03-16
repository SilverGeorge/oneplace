"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MdCheck } from "react-icons/md";
import { cn } from "@/lib/cn";
import {
  STOREFRONT_TEMPLATE_CONFIG_KEY,
  StorefrontTemplate,
  storefrontTemplates
} from "@/lib/storefront-templates";

function badgeStyle(badge: StorefrontTemplate["badge"]): string {
  if (badge === "FREE") return "bg-[#27ae60]";
  if (badge === "POPULAR") return "bg-[#e74c3c]";
  return "bg-[#ffc300] text-slate-900";
}

export default function TemplatesSection() {
  const router = useRouter();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [badgeFilter, setBadgeFilter] = useState<"ALL" | "FREE" | "PREMIUM" | "POPULAR">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | StorefrontTemplate["category"]>(
    "ALL"
  );

  const filteredTemplates = useMemo(() => {
    return storefrontTemplates.filter((template) => {
      const badgeMatch = badgeFilter === "ALL" || template.badge === badgeFilter;
      const categoryMatch = categoryFilter === "ALL" || template.category === categoryFilter;
      return badgeMatch && categoryMatch;
    });
  }, [badgeFilter, categoryFilter]);

  function saveTemplateConfig(
    template: StorefrontTemplate,
    selectedColors: StorefrontTemplate["palette"]
  ) {
    localStorage.setItem("selected-template", JSON.stringify(template));
    localStorage.setItem(
      STOREFRONT_TEMPLATE_CONFIG_KEY,
      JSON.stringify({
        templateId: template.id,
        templateName: template.name,
        colors: selectedColors
      })
    );
  }

  function handleUseTemplate(template: StorefrontTemplate): void {
    saveTemplateConfig(template, template.palette);
    router.push(`/storefront/create?template=${template.id}`);
  }

  function handlePreviewTemplate(template: StorefrontTemplate) {
    saveTemplateConfig(template, template.palette);
    window.open("/store/jon-smith-electronics", "_blank", "noopener,noreferrer");
  }

  return (
    <section className="animate-form-fade bg-[#f1f1f1] py-12 sm:py-14 lg:py-16">
      <div className="container-main">
        <h2 className="text-center text-[40px] font-bold text-[#1a1a1a]">
          Choose Your Storefront Template
        </h2>
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
          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value as "ALL" | StorefrontTemplate["category"])
            }
            className="rounded-full border border-[#e0e0e0] bg-white px-4 py-2 text-xs font-semibold text-slate-700 focus:border-[#008080] focus:outline-none"
          >
            <option value="ALL">All Industries</option>
            <option value="Retail">Retail</option>
            <option value="Marketplace">Marketplace</option>
            <option value="Fashion">Fashion</option>
            <option value="Food">Food</option>
            <option value="Tech">Tech</option>
            <option value="Services">Services</option>
          </select>
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
                    "absolute right-4 top-4 animate-pulse rounded-full px-4 py-2 text-[12px] font-bold text-white",
                    badgeStyle(template.badge)
                  )}
                >
                  {template.badge}
                </span>
              </div>

              <div className="p-6">
                <h3 className="text-[18px] font-bold text-[#1a1a1a]">{template.name}</h3>
                <p className="mt-3 overflow-hidden text-[14px] font-normal text-[#666666] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] [display:-webkit-box]">
                  {template.description}
                </p>

                <p className="mt-3 text-xs text-slate-600">
                  ★ {template.rating.toFixed(1)} / 5.0 • {(template.users / 1000).toFixed(1)}k+
                  stores using this template
                </p>

                <ul className="mt-4 space-y-2">
                  {template.features.slice(0, 4).map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-[12px] font-normal text-[#1a1a1a]"
                    >
                      <span className="inline-flex h-4 w-4 items-center justify-center text-[#008080]">
                        <MdCheck size={16} />
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
                    Use Template
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePreviewTemplate(template)}
                    className="w-full rounded-lg border border-[#008080] bg-transparent px-6 py-3 text-[14px] font-semibold text-[#008080] transition duration-300 hover:bg-[#f0fffe]"
                  >
                    Preview
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
