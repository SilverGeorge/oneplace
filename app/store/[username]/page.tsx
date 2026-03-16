"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { MdFavorite, MdFavoriteBorder, MdFilterAlt, MdShoppingCart, MdStar } from "react-icons/md";
import { cn } from "@/lib/cn";
import { storeProducts } from "@/app/store/data";
import { useStorefrontConfig } from "@/hooks/use-storefront-config";

type StoreTab = "all" | "new" | "best" | "about";

type CartItem = {
  productId: string;
  qty: number;
};

export default function VendorStorePage() {
  const params = useParams<{ username: string }>();
  const router = useRouter();
  const username = params?.username ?? "vendor";
  const [tab, setTab] = useState<StoreTab>("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Top Rated");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const {
    colors,
    templateName,
    coverImage,
    logoImage,
    fontFamily,
    layout,
    storeName,
    storeDescription,
    navigationItems,
    footerText,
    footerLinks,
    customProducts
  } = useStorefrontConfig();
  const productsSource = customProducts.length ? customProducts : storeProducts;

  const isPreviewMode =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("preview") === "1";

  const filteredProducts = useMemo(() => {
    let rows = productsSource;
    if (tab === "new") rows = rows.filter((item) => item.isNew);
    if (tab === "best") rows = rows.filter((item) => item.isBestSeller);
    rows = rows.filter((item) =>
      [item.name, item.category].join(" ").toLowerCase().includes(query.toLowerCase())
    );
    if (category !== "All") rows = rows.filter((item) => item.category === category);
    rows = [...rows].sort((a, b) => {
      if (sort === "Price: Low to High") return a.price - b.price;
      if (sort === "Price: High to Low") return b.price - a.price;
      if (sort === "Most Sold") return b.sold - a.sold;
      return b.rating - a.rating;
    });
    return rows;
  }, [tab, query, category, sort, productsSource]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);

  function notify(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(null), 2200);
  }

  function toggleWishlist(productId: string) {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
    notify("Wishlist updated");
  }

  function addToCart(productId: string) {
    setCart((prev) => {
      const exists = prev.find((item) => item.productId === productId);
      if (exists) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { productId, qty: 1 }];
    });
    notify("Added to cart");
  }

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: colors.background, color: colors.text, fontFamily }}
    >
      <section
        className="relative h-48 sm:h-64"
        style={{ background: `linear-gradient(120deg, ${colors.primary}, ${colors.accent})` }}
      >
        <img
          src={coverImage || "https://picsum.photos/1600/480?random=71"}
          alt="Store cover"
          className="h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-x-4 bottom-4 mx-auto flex max-w-6xl items-end gap-3 sm:inset-x-6">
          <img
            src={logoImage || "https://picsum.photos/160/160?random=72"}
            alt="Store logo"
            className="h-16 w-16 rounded-xl border-2 border-white object-cover sm:h-20 sm:w-20"
          />
          <div className="text-white">
            <h1 className="text-2xl font-bold capitalize sm:text-3xl">{storeName}</h1>
            <p className="inline-flex items-center gap-1 text-sm">
              <MdStar size={16} className="text-[#ffc300]" /> 4.8 (1,234 reviews)
            </p>
            <p className="text-xs opacity-90">Template: {templateName}</p>
            <p className="mt-1 max-w-xl text-xs opacity-90">{storeDescription}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#e0e0e0] bg-white p-3 shadow-sm">
          {[
            { id: "all", fallback: "All Products" },
            { id: "new", fallback: "New Arrivals" },
            { id: "best", fallback: "Best Sellers" },
            { id: "about", fallback: "About" }
          ].map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id as StoreTab)}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm transition",
                tab === item.id
                  ? "font-semibold text-white"
                  : "border-[#e0e0e0] text-[#333] hover:bg-[#f8fffe]"
              )}
              style={
                tab === item.id
                  ? { borderColor: colors.primary, backgroundColor: colors.primary }
                  : undefined
              }
            >
              {navigationItems[index] ?? item.fallback}
            </button>
          ))}
          {!isPreviewMode ? (
            <button
              type="button"
              onClick={() => router.push(`/store/${username}/checkout`)}
              className="ml-auto inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: colors.primary }}
            >
              <MdShoppingCart size={16} />
              Cart ({cartCount})
            </button>
          ) : null}
        </div>

        {tab === "all" || tab === "new" || tab === "best" ? (
          <>
            <section className="mb-4 rounded-xl border border-[#e0e0e0] bg-white p-3 shadow-sm">
              <div className="grid gap-2 md:grid-cols-4">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={inputClass}
                  placeholder="Search products..."
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={inputClass}
                >
                  {["All", "Electronics", "Accessories"].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className={inputClass}
                >
                  {["Top Rated", "Price: Low to High", "Price: High to Low", "Most Sold"].map(
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
                  More Filters
                </button>
              </div>
            </section>

            {isPreviewMode ? (
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <article
                    key={index}
                    className="overflow-hidden rounded-xl border border-[#e0e0e0] bg-white shadow-sm"
                  >
                    <div className="h-48 bg-[#f0f0f0]" />
                    <div className="p-4">
                      <div className="h-4 w-2/3 rounded bg-[#efefef]" />
                      <div className="mt-2 h-3 w-1/3 rounded bg-[#f2f2f2]" />
                      <div
                        className="mt-4 h-9 rounded"
                        style={{ backgroundColor: colors.primary, opacity: 0.18 }}
                      />
                    </div>
                  </article>
                ))}
              </section>
            ) : (
              <section
                className={cn(
                  "grid gap-4",
                  layout === "full"
                    ? "grid-cols-1"
                    : layout === "sidebar"
                      ? "grid-cols-1 lg:grid-cols-2"
                      : "sm:grid-cols-2 xl:grid-cols-3"
                )}
              >
                {filteredProducts.map((product) => (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-xl border border-[#e0e0e0] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <Link href={`/store/${username}/product/${product.id}`}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-48 w-full object-cover"
                      />
                    </Link>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/store/${username}/product/${product.id}`}
                            className="text-base font-bold text-[#1a1a1a] transition"
                            style={{ color: colors.text }}
                          >
                            {product.name}
                          </Link>
                          <p className="text-xs text-[#666]">{product.category}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleWishlist(product.id)}
                          aria-label={`Wishlist ${product.name}`}
                        >
                          {wishlist.includes(product.id) ? (
                            <MdFavorite className="text-[#e74c3c]" size={20} />
                          ) : (
                            <MdFavoriteBorder className="text-[#666]" size={20} />
                          )}
                        </button>
                      </div>
                      <p className="mt-2 text-lg font-bold" style={{ color: colors.primary }}>
                        ${product.price.toFixed(2)}
                      </p>
                      <p className="text-xs text-[#666]">
                        ⭐ {product.rating.toFixed(1)} ({product.reviews}) • {product.sold} sold
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => addToCart(product.id)}
                          className="rounded-lg px-3 py-2 text-xs font-semibold text-white"
                          style={{ backgroundColor: colors.primary }}
                        >
                          Add to Cart
                        </button>
                        <Link
                          href={`/store/${username}/product/${product.id}`}
                          className="rounded-lg border px-3 py-2 text-xs font-semibold"
                          style={{ borderColor: colors.primary, color: colors.primary }}
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            )}
          </>
        ) : null}

        {tab === "about" ? (
          <section className="rounded-xl border border-[#e0e0e0] bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-[#1a1a1a]">About This Store</h2>
            <p className="mt-2 text-sm text-[#666]">{storeDescription}</p>
          </section>
        ) : null}

        <footer className="mt-6 rounded-xl border border-[#e0e0e0] bg-white px-4 py-5 text-sm text-[#666] shadow-sm">
          <p className="font-semibold text-[#1a1a1a]">{footerText}</p>
          <p className="mt-1">{footerLinks.join(" • ")}</p>
        </footer>
      </div>

      {toast ? (
        <div className="fixed right-4 top-4 z-50 rounded-lg bg-[#27ae60] px-4 py-2 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </main>
  );
}

const inputClass =
  "w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-sm text-[#1a1a1a] transition focus:border-[#008080] focus:outline-none";
