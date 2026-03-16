"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

const categories = [
  "Clothing",
  "Electronics",
  "Food",
  "Beauty",
  "Home",
  "Sports",
  "Books",
  "Health",
  "Tech",
  "Fashion",
  "Skincare"
];

const productLabels = [
  "Essentials",
  "Prime",
  "Studio",
  "Select",
  "Hub",
  "Market",
  "Works",
  "Central"
];

const categoryProducts = Object.fromEntries(
  categories.map((category) => [
    category,
    productLabels.map((label, index) => ({
      id: `${category}-${index}`,
      name: `${category} ${label}`,
      image: `/images/${category.toLowerCase()}-${index + 1}.jpg`,
      description: `Explore top ${category.toLowerCase()} products and trusted stores tailored for your needs.`
    }))
  ])
) as Record<string, Array<{ id: string; name: string; image: string; description: string }>>;

export default function Categories() {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]); // Clothing is first
  const [displayCategory, setDisplayCategory] = useState<string>(categories[0]);
  const [isFading, setIsFading] = useState(false);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});
  const timerRef = useRef<number | null>(null);

  function handleCategoryChange(category: string) {
    if (category === activeCategory) return;

    setActiveCategory(category);
    setIsFading(true);

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      setDisplayCategory(category);
      setIsFading(false);
      timerRef.current = null;
    }, 180);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <section id="categories" className="container-main py-12 sm:py-14 lg:py-16">
      <h2 className="text-center text-[44px] font-bold text-slate-900">Browse Categories</h2>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {categories.map((category) => {
          const isActive = activeCategory === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() => handleCategoryChange(category)}
              className={cn(
                "rounded-full border border-[#e0e0e0] px-3 py-1.5 text-xs font-semibold transition duration-300 sm:px-4 sm:py-2",
                isActive
                  ? "bg-[#008080] text-white"
                  : "bg-white text-slate-700 hover:scale-[1.02] hover:border-[#008080] hover:text-[#008080]"
              )}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div
        className={cn(
          "mt-8 grid grid-cols-1 gap-4 transition-opacity duration-300",
          "md:grid-cols-2 lg:grid-cols-3",
          isFading ? "opacity-0" : "opacity-100"
        )}
      >
        {categoryProducts[displayCategory].slice(0, 6).map((item) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-2xl border border-[#e0e0e0] bg-[#fff] shadow-sm transition duration-300 hover:-translate-y-[6px] hover:shadow-xl"
          >
            <div className="relative h-[200px] w-full bg-slate-100">
              {imageErrorMap[item.id] ? (
                <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
                  Image unavailable
                </div>
              ) : (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  unoptimized
                  onError={() => setImageErrorMap((prev) => ({ ...prev, [item.id]: true }))}
                />
              )}
            </div>
            <div className="p-4">
              <h3 className="text-[16px] font-bold text-[#1a1a1a]">{item.name}</h3>
              <p className="mt-2 overflow-hidden text-[14px] font-normal text-[#666666] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] [display:-webkit-box]">
                {item.description}
              </p>
              <button className="mt-4 w-full rounded-lg bg-[#008080] px-4 py-3 text-[14px] font-semibold text-white transition duration-300 hover:scale-105 hover:shadow-lg">
                Shop Now
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
