"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { getProductById } from "@/app/store/data";

type CartLine = { productId: string; qty: number };

export default function CheckoutPage() {
  const params = useParams<{ username: string }>();
  const username = params?.username ?? "vendor";
  const [cartLines, setCartLines] = useState<CartLine[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem("store-cart");
      return raw ? (JSON.parse(raw) as CartLine[]) : [];
    } catch {
      return [];
    }
  });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [card, setCard] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const subtotal = useMemo(() => {
    return cartLines.reduce((sum, line) => {
      const product = getProductById(line.productId);
      if (!product) return sum;
      return sum + product.price * line.qty;
    }, 0);
  }, [cartLines]);

  const shipping = subtotal > 200 ? 0 : 12;
  const total = subtotal + shipping;

  function placeOrder() {
    if (!name.trim() || !email.trim() || !address.trim() || card.trim().length < 8) {
      setToast("Please complete all checkout details");
      return;
    }
    if (typeof window !== "undefined") window.localStorage.removeItem("store-cart");
    setCartLines([]);
    setToast("Order placed successfully");
  }

  return (
    <main className="min-h-screen bg-[#f6f8f9] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/store/${username}`}
          className="text-sm font-semibold text-[#008080] hover:underline"
        >
          ← Continue Shopping
        </Link>

        <h1 className="mt-2 text-3xl font-bold text-[#1a1a1a]">Checkout</h1>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_360px]">
          <section className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold text-[#1a1a1a]">Shipping & Payment</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="text-sm font-semibold text-[#333]">
                Full Name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-semibold text-[#333]">
                Email
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-semibold text-[#333] md:col-span-2">
                Address
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-semibold text-[#333] md:col-span-2">
                Card Number
                <input
                  value={card}
                  onChange={(e) => setCard(e.target.value)}
                  className={inputClass}
                  placeholder="**** **** **** ****"
                />
              </label>
            </div>
          </section>

          <aside className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold text-[#1a1a1a]">Order Summary</h2>
            <div className="mt-3 space-y-2 text-sm text-[#666]">
              {cartLines.length === 0 ? (
                <p>Your cart is empty.</p>
              ) : (
                cartLines.map((line) => {
                  const product = getProductById(line.productId);
                  if (!product) return null;
                  return (
                    <div key={line.productId} className="flex items-center justify-between">
                      <span>
                        {product.name} x{line.qty}
                      </span>
                      <span>${(product.price * line.qty).toFixed(2)}</span>
                    </div>
                  );
                })
              )}
            </div>
            <div className="mt-4 space-y-1 border-t border-[#f0f0f0] pt-3 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#1a1a1a]">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={placeOrder}
              className="mt-4 w-full rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
            >
              Place Order
            </button>
          </aside>
        </div>
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
