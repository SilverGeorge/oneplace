"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { MdFavorite, MdFavoriteBorder, MdStar } from "react-icons/md";
import { getProductById } from "@/app/store/data";
import { useStorefrontTheme } from "@/hooks/use-storefront-theme";

export default function ProductDetailPage() {
  const params = useParams<{ username: string; id: string }>();
  const router = useRouter();
  const username = params?.username ?? "vendor";
  const id = params?.id ?? "";
  const product = getProductById(id);
  const [size, setSize] = useState(product?.variants.sizes[0] ?? "");
  const [color, setColor] = useState(product?.variants.colors[0] ?? "");
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const { colors } = useStorefrontTheme();

  const subtotal = useMemo(() => (product ? product.price * qty : 0), [product, qty]);

  if (!product) {
    return (
      <main
        className="min-h-screen px-4 py-10 sm:px-6"
        style={{ backgroundColor: colors.background }}
      >
        <div className="mx-auto max-w-3xl rounded-xl border border-[#e0e0e0] bg-white p-6 text-center">
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Product not found</h1>
          <Link
            href={`/store/${username}`}
            className="mt-3 inline-flex rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: colors.primary }}
          >
            Back to Store
          </Link>
        </div>
      </main>
    );
  }
  const resolvedProduct = product;

  function notify(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(null), 2200);
  }

  function addToCart() {
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem("store-cart");
      const parsed = raw ? (JSON.parse(raw) as Array<{ productId: string; qty: number }>) : [];
      const exists = parsed.find((item) => item.productId === resolvedProduct.id);
      const next = exists
        ? parsed.map((item) =>
            item.productId === resolvedProduct.id ? { ...item, qty: item.qty + qty } : item
          )
        : [...parsed, { productId: resolvedProduct.id, qty }];
      window.localStorage.setItem("store-cart", JSON.stringify(next));
    }
    notify("Added to cart");
  }

  function submitReview() {
    if (!reviewName.trim() || reviewText.trim().length < 10) {
      notify("Enter your name and a valid review");
      return;
    }
    notify("Review submitted");
    setReviewName("");
    setReviewText("");
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6" style={{ backgroundColor: colors.background }}>
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/store/${username}`}
          className="text-sm font-semibold hover:underline"
          style={{ color: colors.primary }}
        >
          ← Back to Store
        </Link>

        <section className="mt-3 grid gap-4 rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm lg:grid-cols-[1fr_420px]">
          <img
            src={resolvedProduct.image}
            alt={resolvedProduct.name}
            className="h-80 w-full rounded-lg object-cover lg:h-full"
          />
          <div>
            <h1 className="text-3xl font-bold text-[#1a1a1a]">{resolvedProduct.name}</h1>
            <p className="mt-1 text-sm text-[#666]">{resolvedProduct.category}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-sm text-[#666]">
              <MdStar size={16} className="text-[#ffc300]" /> {resolvedProduct.rating.toFixed(1)} (
              {resolvedProduct.reviews} reviews)
            </p>
            <p className="mt-3 text-3xl font-bold" style={{ color: colors.primary }}>
              ${resolvedProduct.price.toFixed(2)}
            </p>
            <p className="mt-2 text-sm text-[#666]">{resolvedProduct.description}</p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <label className="text-sm font-semibold text-[#333]">
                Size
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className={inputClass}
                >
                  {resolvedProduct.variants.sizes.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold text-[#333]">
                Color
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className={inputClass}
                >
                  {resolvedProduct.variants.colors.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <label className="text-sm font-semibold text-[#333]">
                Qty
                <input
                  type="number"
                  min={1}
                  max={Math.max(resolvedProduct.stock, 1)}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                  className={`${inputClass} ml-2 inline-block w-20`}
                />
              </label>
              <p className="text-sm text-[#666]">Stock: {resolvedProduct.stock}</p>
            </div>

            <p className="mt-2 text-sm font-semibold text-[#1a1a1a]">
              Subtotal: ${subtotal.toFixed(2)}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={addToCart}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: colors.primary }}
              >
                Add to Cart
              </button>
              <button
                type="button"
                onClick={() => {
                  addToCart();
                  router.push(`/store/${username}/checkout`);
                }}
                className="rounded-lg border px-4 py-2 text-sm font-semibold"
                style={{ borderColor: colors.primary, color: colors.primary }}
              >
                Buy Now
              </button>
              <button
                type="button"
                onClick={() => setWishlisted((prev) => !prev)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm font-semibold text-[#333]"
              >
                {wishlisted ? (
                  <MdFavorite className="text-[#e74c3c]" size={18} />
                ) : (
                  <MdFavoriteBorder size={18} />
                )}
                Wishlist
              </button>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm">
          <h2 className="text-xl font-bold text-[#1a1a1a]">Reviews</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p className="rounded-lg bg-[#f8fffe] p-3">
              ⭐ 5.0 &quot;Amazing quality and fast shipping!&quot; - Sandra
            </p>
            <p className="rounded-lg bg-[#f8fffe] p-3">
              ⭐ 4.0 &quot;Works well, exactly as described.&quot; - Tobi
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
            className="mt-3 rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: colors.primary }}
          >
            Submit Review
          </button>
        </section>
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
  "mt-1 w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-sm text-[#1a1a1a] transition focus:border-[#008080] focus:outline-none";
