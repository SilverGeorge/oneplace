"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { MdCheckCircle, MdClose, MdMenu, MdWarningAmber } from "react-icons/md";
import { cn } from "@/lib/cn";
import { SidebarMenu, withPreviewParam } from "@/components/dashboard/SidebarMenu";
import { usePreviewMode } from "@/hooks/use-preview-mode";

type Tab = "current" | "history" | "payment" | "upgrade";

const plans = [
  { name: "Free", price: "$0/month", features: ["10 products", "Basic support"], key: "free" },
  { name: "Basic", price: "$9/month", features: ["30 products", "Email support"], key: "basic" },
  {
    name: "Pro",
    price: "$29/month",
    features: ["100 products", "Advanced analytics", "Priority support"],
    key: "pro"
  },
  {
    name: "Premium",
    price: "$99/month",
    features: ["Unlimited products", "24/7 support", "API access"],
    key: "premium"
  }
];

export default function SubscriptionPage() {
  const pathname = usePathname() ?? "/dashboard/subscription";
  const isPreviewMode = usePreviewMode();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("current");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState("pro");

  const current = useMemo(
    () => plans.find((p) => p.key === currentPlan) ?? plans[2],
    [currentPlan]
  );

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
            &gt; Subscription
          </nav>
          <h1 className="mt-2 text-[40px] font-bold text-[#008080]">Subscription & Billing</h1>
          <p className="text-sm text-[#666]">Manage your subscription plan and billing</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { id: "current", label: "Current Plan" },
              { id: "history", label: "Billing History" },
              { id: "payment", label: "Payment Methods" },
              { id: "upgrade", label: "Upgrade" }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id as Tab)}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm font-semibold",
                  tab === item.id
                    ? "border-[#008080] bg-[#008080] text-white"
                    : "border-[#e0e0e0] text-[#333] hover:bg-[#f0fffe]"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === "current" ? (
            <section className="mt-4 rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-[24px] font-bold text-[#008080]">{current.name} Plan</h2>
                  <p className="text-[32px] font-bold text-[#1a1a1a]">{current.price}</p>
                  <span className="inline-flex rounded-full bg-[#27ae60] px-2.5 py-1 text-xs font-semibold text-white">
                    Active
                  </span>
                  <p className="mt-2 text-sm text-[#666]">Renews on Apr 10, 2024</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setShowUpgrade(true)}
                    className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Upgrade Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUpgrade(true)}
                    className="rounded-lg border border-[#e0e0e0] bg-[#f0f0f0] px-4 py-2 text-sm font-semibold text-[#333]"
                  >
                    Downgrade Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCancel(true)}
                    className="rounded-lg bg-[#e74c3c] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Cancel Subscription
                  </button>
                </div>
              </div>
              <ul className="mt-4 grid gap-2 md:grid-cols-2">
                {current.features.map((feature) => (
                  <li
                    key={feature}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#e0e0e0] bg-[#f8fffe] px-3 py-2 text-sm"
                  >
                    <MdCheckCircle className="text-[#008080]" size={18} />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <Usage label="Products" value={45} max={100} />
                <Usage label="API calls" value={25} max={100} />
                <Usage label="Storage" value={50} max={100} />
                <Usage label="Custom domains" value={66} max={100} />
              </div>
              <div className="mt-5 rounded-lg border border-[#e0e0e0] p-4">
                <h3 className="text-[18px] font-bold text-[#1a1a1a]">Next Billing Date</h3>
                <p className="text-sm text-[#666]">Apr 10, 2024 • $29.00 • Upcoming</p>
                <button
                  type="button"
                  className="mt-2 text-sm font-semibold text-[#008080] hover:underline"
                >
                  View invoice
                </button>
              </div>
            </section>
          ) : null}

          {tab === "history" ? (
            <section className="mt-4 rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <h2 className="text-[28px] font-bold text-[#1a1a1a]">Billing History</h2>
              <div className="mt-3 grid gap-2 md:grid-cols-4">
                <input placeholder="Date range" className={inputClass} />
                <select className={inputClass}>
                  {["All", "Paid", "Pending", "Failed"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <select className={inputClass}>
                  {["Newest", "Oldest", "Highest", "Lowest"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead className="bg-[#f5f5f5] text-sm font-bold text-[#333]">
                    <tr>
                      {["Invoice #", "Date", "Amount", "Status", "Actions"].map((h) => (
                        <th key={h} className="px-4 py-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["INV-2024-001", "Mar 10, 2024", "$29.00", "Paid"],
                      ["INV-2024-002", "Feb 10, 2024", "$29.00", "Paid"],
                      ["INV-2024-003", "Jan 10, 2024", "$29.00", "Pending"]
                    ].map(([id, date, amount, status]) => (
                      <tr key={id} className="border-t border-[#f0f0f0] text-sm text-[#666]">
                        <td className="px-4 py-3 font-semibold text-[#008080]">#{id}</td>
                        <td className="px-4 py-3">{date}</td>
                        <td className="px-4 py-3">{amount}</td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                              status === "Paid"
                                ? "bg-[#27ae60] text-white"
                                : "bg-[#f59e0b] text-white"
                            )}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button type="button" className="mr-2 text-[#008080] hover:underline">
                            Download PDF
                          </button>
                          <button type="button" className="text-[#008080] hover:underline">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {tab === "payment" ? (
            <section className="mt-4 rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <h2 className="text-[28px] font-bold text-[#1a1a1a]">Payment Methods</h2>
              <div className="mt-4 space-y-2">
                {["Visa •••• 4242", "Mastercard •••• 7821"].map((card, index) => (
                  <div
                    key={card}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#e0e0e0] p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#1a1a1a]">{card}</p>
                      <p className="text-xs text-[#999]">Expires 12/26</p>
                    </div>
                    <div className="flex gap-2">
                      {index === 0 ? (
                        <span className="inline-flex rounded-full bg-[#27ae60] px-2 py-1 text-xs font-semibold text-white">
                          DEFAULT PAYMENT METHOD
                        </span>
                      ) : null}
                      <button
                        type="button"
                        className="rounded-lg border border-[#e0e0e0] bg-[#f0f0f0] px-3 py-1.5 text-xs font-semibold text-[#333]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-[#e74c3c] px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="mt-4 rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
              >
                + Add Payment Method
              </button>
            </section>
          ) : null}

          {tab === "upgrade" ? (
            <section className="mt-4 rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <div className="flex items-center justify-between">
                <h2 className="text-[28px] font-bold text-[#1a1a1a]">All Available Plans</h2>
                <button
                  type="button"
                  onClick={() => setShowCompare(true)}
                  className="text-sm font-semibold text-[#008080] hover:underline"
                >
                  View detailed comparison
                </button>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {plans.map((plan) => (
                  <article
                    key={plan.key}
                    className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm"
                  >
                    <h3 className="text-[18px] font-bold text-[#1a1a1a]">{plan.name}</h3>
                    <p className="mt-2 text-[28px] font-bold text-[#008080]">{plan.price}</p>
                    {plan.key === currentPlan ? (
                      <span className="inline-flex rounded-full bg-[#27ae60] px-2 py-1 text-xs font-semibold text-white">
                        CURRENT PLAN
                      </span>
                    ) : null}
                    <ul className="mt-3 space-y-1 text-sm text-[#666]">
                      {plan.features.map((feature) => (
                        <li key={feature}>• {feature}</li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => {
                        if (plan.key !== currentPlan) setCurrentPlan(plan.key);
                        setToast("Plan updated successfully");
                      }}
                      className={cn(
                        "mt-4 w-full rounded-lg px-3 py-2 text-sm font-semibold",
                        plan.key === currentPlan
                          ? "bg-[#f0f0f0] text-[#666]"
                          : "bg-[#008080] text-white"
                      )}
                    >
                      {plan.key === currentPlan ? "Current Plan" : `Upgrade to ${plan.name}`}
                    </button>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>

      {showUpgrade ? (
        <Modal title="Change Plan" onClose={() => setShowUpgrade(false)}>
          <p className="text-sm text-[#666]">Your plan will change on your next billing date.</p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowUpgrade(false)}
              className="rounded-lg border border-[#e0e0e0] bg-[#f0f0f0] px-4 py-2 text-sm font-semibold text-[#333]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setShowUpgrade(false);
                setToast("Plan updated successfully");
              }}
              className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
            >
              Confirm
            </button>
          </div>
        </Modal>
      ) : null}

      {showCancel ? (
        <Modal title="Cancel Subscription?" onClose={() => setShowCancel(false)}>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#fdecea] text-[#e74c3c]">
            <MdWarningAmber size={30} />
          </div>
          <p className="text-sm text-[#666]">
            We&apos;re sorry to see you go. Your subscription remains active until Apr 10, 2024.
          </p>
          <label className="mt-3 block text-sm text-[#1a1a1a]">
            Why are you cancelling?
            <textarea className={`${inputClass} mt-1`} rows={3} />
          </label>
          <label className="mt-2 inline-flex items-center gap-2 text-sm text-[#666]">
            <input type="checkbox" className="h-4 w-4 accent-[#008080]" /> Offer me a discount to
            stay
          </label>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCancel(false)}
              className="rounded-lg border border-[#e0e0e0] bg-[#f0f0f0] px-4 py-2 text-sm font-semibold text-[#333]"
            >
              Keep Subscription
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCancel(false);
                setToast("Subscription cancelled");
              }}
              className="rounded-lg bg-[#e74c3c] px-4 py-2 text-sm font-semibold text-white"
            >
              Cancel Subscription
            </button>
          </div>
        </Modal>
      ) : null}

      {showCompare ? (
        <Modal title="Plan Comparison" onClose={() => setShowCompare(false)}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[#999]">
                <th className="py-2">Plan</th>
                <th className="py-2">Products</th>
                <th className="py-2">Support</th>
                <th className="py-2">API</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Free", "10", "Basic", "No"],
                ["Basic", "30", "Email", "Limited"],
                ["Pro", "100", "Priority", "Yes"],
                ["Premium", "Unlimited", "24/7", "Yes"]
              ].map(([plan, products, support, api]) => (
                <tr key={plan} className="border-t border-[#efefef]">
                  <td className="py-2">{plan}</td>
                  <td className="py-2">{products}</td>
                  <td className="py-2">{support}</td>
                  <td className="py-2">{api}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      ) : null}

      {toast ? (
        <div className="fixed right-4 top-4 z-[70] rounded-lg bg-[#27ae60] px-4 py-3 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </main>
  );
}

function Usage({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm text-[#666]">
        <span>{label}</span>
        <span>
          {value} of {max} used
        </span>
      </div>
      <div className="h-2 rounded-full bg-[#f0f0f0]">
        <div
          className="h-2 rounded-full bg-[#008080]"
          style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        />
      </div>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-[#1a1a1a]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[#666] hover:bg-[#f5f5f5]"
          >
            <MdClose size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-sm text-[#1a1a1a] transition focus:border-[#008080] focus:outline-none";
