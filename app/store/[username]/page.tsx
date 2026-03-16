"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { MdFavorite, MdFavoriteBorder, MdFilterAlt, MdShoppingCart, MdStar } from "react-icons/md";
import { cn } from "@/lib/cn";
import { storeProducts } from "@/app/store/data";

type StoreTab = "all" | "new" | "best" | "about" | "reviews" | "contact";

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
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  const filteredProducts = useMemo(() => {
    let rows = storeProducts;
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
  }, [tab, query, category, sort]);

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
      if (exists)
        return prev.map((item) =>
          item.productId === productId ? { ...item, qty: item.qty + 1 } : item
        );
      return [...prev, { productId, qty: 1 }];
    });
    notify("Added to cart");
  }

  function submitReview() {
    if (!reviewName.trim() || reviewText.trim().length < 10) {
      notify("Enter name and a longer review");
      return;
    }
    notify("Review submitted successfully");
    setReviewName("");
    setReviewText("");
  }

  function submitContact() {
    if (!contactName.trim() || !contactEmail.trim() || contactMessage.trim().length < 15) {
      notify("Please complete contact form");
      return;
    }
    notify("Message sent. We will contact you shortly.");
    setContactName("");
    setContactEmail("");
    setContactMessage("");
  }

  return (
    <main className="min-h-screen bg-[#f6f8f9]">
      <section className="relative h-48 bg-gradient-to-r from-[#0f766e] to-[#115e59] sm:h-64">
        <img
          src="https://picsum.photos/1600/480?random=71"
          alt="Store cover"
          className="h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-x-4 bottom-4 mx-auto flex max-w-6xl items-end gap-3 sm:inset-x-6">
          <img
            src="https://picsum.photos/160/160?random=72"
            alt="Store logo"
            className="h-16 w-16 rounded-xl border-2 border-white object-cover sm:h-20 sm:w-20"
          />
          <div className="text-white">
            <h1 className="text-2xl font-bold capitalize sm:text-3xl">
              {username.replace(/-/g, " ")} Store
            </h1>
            <p className="inline-flex items-center gap-1 text-sm">
              <MdStar size={16} className="text-[#ffc300]" /> 4.8 (1,234 reviews)
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#e0e0e0] bg-white p-3 shadow-sm">
          {[
            { id: "all", label: "All Products" },
            { id: "new", label: "New Arrivals" },
            { id: "best", label: "Best Sellers" },
            { id: "about", label: "About" },
            { id: "reviews", label: "Reviews" },
            { id: "contact", label: "Contact" }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id as StoreTab)}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm transition",
                tab === item.id
                  ? "border-[#008080] bg-[#008080] font-semibold text-white"
                  : "border-[#e0e0e0] text-[#333] hover:bg-[#f8fffe]"
              )}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => router.push(`/store/${username}/checkout`)}
            className="ml-auto inline-flex items-center gap-1 rounded-lg bg-[#008080] px-3 py-2 text-sm font-semibold text-white"
          >
            <MdShoppingCart size={16} />
            Cart ({cartCount})
          </button>
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

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
                          className="text-base font-bold text-[#1a1a1a] hover:text-[#008080]"
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
                    <p className="mt-2 text-lg font-bold text-[#008080]">
                      ${product.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-[#666]">
                      ⭐ {product.rating.toFixed(1)} ({product.reviews}) • {product.sold} sold
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => addToCart(product.id)}
                        className="rounded-lg bg-[#008080] px-3 py-2 text-xs font-semibold text-white"
                      >
                        Add to Cart
                      </button>
                      <Link
                        href={`/store/${username}/product/${product.id}`}
                        className="rounded-lg border border-[#e0e0e0] px-3 py-2 text-xs font-semibold text-[#333]"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          </>
        ) : null}

        {tab === "about" ? (
          <section className="rounded-xl border border-[#e0e0e0] bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-[#1a1a1a]">About This Store</h2>
            <p className="mt-2 text-sm text-[#666]">
              {username.replace(/-/g, " ")} is a trusted vendor delivering high-quality products and
              fast support. We focus on premium inventory, fast shipping, and customer-first
              service.
            </p>
          </section>
        ) : null}

        {tab === "reviews" ? (
          <section className="rounded-xl border border-[#e0e0e0] bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-[#1a1a1a]">Customer Reviews</h2>
            <div className="mt-3 space-y-2 text-sm">
              <p className="rounded-lg bg-[#f8fffe] p-3">
                ⭐ 5.0 &quot;Great quality and quick shipping.&quot; - Alice
              </p>
              <p className="rounded-lg bg-[#f8fffe] p-3">
                ⭐ 4.0 &quot;Product was as described.&quot; - Mark
              </p>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              <input
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                className={inputClass}
                placeholder="Your name"
              />
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className={inputClass}
                rows={3}
                placeholder="Write your review..."
              />
            </div>
            <button
              type="button"
              onClick={submitReview}
              className="mt-3 rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
            >
              Submit Review
            </button>
          </section>
        ) : null}

        {tab === "contact" ? (
          <section className="rounded-xl border border-[#e0e0e0] bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-[#1a1a1a]">Contact Vendor</h2>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className={inputClass}
                placeholder="Your name"
              />
              <input
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className={inputClass}
                placeholder="Your email"
              />
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className={`${inputClass} md:col-span-2`}
                rows={4}
                placeholder="Message..."
              />
            </div>
            <button
              type="button"
              onClick={submitContact}
              className="mt-3 rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
            >
              Send Message
            </button>
          </section>
        ) : null}
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
