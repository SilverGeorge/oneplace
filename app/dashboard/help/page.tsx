"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  MdMenu,
  MdSearch,
  MdLightbulb,
  MdQuestionAnswer,
  MdDescription,
  MdPayment,
  MdSettings,
  MdApi,
  MdClose
} from "react-icons/md";
import { cn } from "@/lib/cn";
import { SidebarMenu, withPreviewParam } from "@/components/dashboard/SidebarMenu";

type Tab = "faq" | "kb" | "contact" | "status";

const faqCategories = [
  { id: "start", icon: MdLightbulb, label: "Getting Started", count: 8 },
  { id: "invoicing", icon: MdDescription, label: "Invoicing", count: 12 },
  { id: "subscription", icon: MdPayment, label: "Subscription", count: 9 },
  { id: "technical", icon: MdApi, label: "Technical", count: 6 }
];

const faqItems = [
  {
    category: "start",
    q: "How do I create an invoice?",
    a: "Go to Invoicing > Create Invoice, fill details, and click Send Invoice."
  },
  {
    category: "invoicing",
    q: "Can I edit sent invoices?",
    a: "Sent invoices are locked. Duplicate and issue a corrected invoice."
  },
  {
    category: "subscription",
    q: "How do I upgrade my plan?",
    a: "Open Subscription > Upgrade and confirm the plan change."
  },
  {
    category: "technical",
    q: "How do I generate an API key?",
    a: "Settings > API Keys > Generate New Key."
  }
];

export default function HelpPage() {
  const pathname = usePathname() ?? "/dashboard/help";
  const searchParams = useSearchParams();
  const isPreviewMode = searchParams?.get("preview") === "1";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("faq");
  const [selectedCategory, setSelectedCategory] = useState("start");
  const [search, setSearch] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [contactSent, setContactSent] = useState(false);
  const [ticket, setTicket] = useState("");
  const [articleOpen, setArticleOpen] = useState<string | null>(null);

  const filteredFaq = useMemo(() => {
    return faqItems.filter((item) => {
      const matchCat = item.category === selectedCategory;
      const matchSearch =
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, search]);

  function submitSupport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTicket(`#${Math.floor(10000 + Math.random() * 90000)}`);
    setContactSent(true);
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
            &gt; Help
          </nav>
          <h1 className="mt-2 text-[40px] font-bold text-[#008080]">Help & Support</h1>
          <p className="text-sm text-[#666]">Get answers and support from our team</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { id: "faq", label: "FAQ" },
              { id: "kb", label: "Knowledge Base" },
              { id: "contact", label: "Contact Support" },
              { id: "status", label: "Status" }
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

          {tab === "faq" ? (
            <section className="mt-4 space-y-4">
              <div className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <div className="flex h-12 items-center rounded-lg border border-[#e0e0e0] px-3">
                  <MdSearch size={20} className="text-[#999]" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search help articles..."
                    className="ml-2 w-full text-[16px] outline-none"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {faqCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        "rounded-xl border border-[#e0e0e0] bg-[#f8fffe] p-4 text-left transition hover:-translate-y-1 hover:shadow-md",
                        selectedCategory === cat.id && "border-[#008080]"
                      )}
                    >
                      <Icon size={32} className="text-[#008080]" />
                      <h3 className="mt-2 text-base font-bold text-[#1a1a1a]">{cat.label}</h3>
                      <p className="text-xs text-[#999]">{cat.count} articles</p>
                    </button>
                  );
                })}
              </div>
              <div className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                {filteredFaq.map((faq, index) => {
                  const key = `${faq.category}-${index}`;
                  const open = expandedFaq === key;
                  return (
                    <article key={key} className="border-b border-[#f0f0f0] py-3 last:border-b-0">
                      <button
                        type="button"
                        onClick={() => setExpandedFaq(open ? null : key)}
                        className="w-full text-left"
                      >
                        <p className="text-sm font-bold text-[#1a1a1a]">{faq.q}</p>
                      </button>
                      <p
                        className={cn(
                          "text-sm text-[#666] transition-all",
                          open ? "mt-2 block" : "mt-1 line-clamp-2"
                        )}
                      >
                        {faq.a}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-xs text-[#999]">
                        <span>👍 24 people found this helpful</span>
                        <button type="button" className="text-[#008080] hover:underline">
                          Read more
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}

          {tab === "kb" ? (
            <section className="mt-4 rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <div className="grid gap-2 md:grid-cols-3">
                <input placeholder="Search articles..." className={inputClass} />
                <select className={inputClass}>
                  <option>All categories</option>
                </select>
                <select className={inputClass}>
                  <option>Newest</option>
                  <option>Most viewed</option>
                  <option>Most helpful</option>
                </select>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  [
                    "How to Create Invoices",
                    "Step-by-step guide to creating your first invoice",
                    "5 min read",
                    "Invoicing"
                  ],
                  [
                    "Managing Subscriptions",
                    "Upgrade or downgrade your plan safely",
                    "4 min read",
                    "Subscription"
                  ],
                  [
                    "Troubleshooting API Keys",
                    "Fix common API key issues quickly",
                    "6 min read",
                    "Technical"
                  ]
                ].map(([title, desc, read, cat]) => (
                  <article
                    key={title}
                    className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm"
                  >
                    <div className="h-28 rounded-lg bg-[#f3f3f3]" />
                    <h3 className="mt-3 text-sm font-bold text-[#1a1a1a]">{title}</h3>
                    <p className="mt-1 text-xs text-[#666]">{desc}</p>
                    <p className="mt-1 text-xs text-[#999]">
                      {read} • {cat}
                    </p>
                    <button
                      type="button"
                      onClick={() => setArticleOpen(title)}
                      className="mt-2 text-sm font-semibold text-[#008080] hover:underline"
                    >
                      Open article
                    </button>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {tab === "contact" ? (
            <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
              <form
                onSubmit={submitSupport}
                className="rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
              >
                <h2 className="text-[24px] font-bold text-[#1a1a1a]">Contact Our Support Team</h2>
                <p className="mt-1 text-sm text-[#666]">
                  We&apos;re here to help. Fill out the form below.
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <Field label="Name *">
                    <input required className={inputClass} />
                  </Field>
                  <Field label="Email *">
                    <input required type="email" className={inputClass} />
                  </Field>
                  <Field label="Subject *" className="md:col-span-2">
                    <input required className={inputClass} />
                  </Field>
                  <Field label="Category *">
                    <select required className={inputClass}>
                      {["General", "Invoicing", "Subscription", "Orders", "Technical", "Other"].map(
                        (s) => (
                          <option key={s}>{s}</option>
                        )
                      )}
                    </select>
                  </Field>
                  <Field label="Priority *">
                    <select required className={inputClass}>
                      {["Low", "Normal", "High", "Urgent"].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Message *" className="md:col-span-2">
                    <textarea required minLength={20} rows={4} className={inputClass} />
                  </Field>
                  <Field label="Attachments">
                    <input type="file" className={inputClass} />
                  </Field>
                  <label className="inline-flex items-center gap-2 text-sm text-[#666] md:col-span-2">
                    <input type="checkbox" className="h-4 w-4 accent-[#008080]" /> I&apos;ve checked
                    the FAQ and knowledge base
                  </label>
                </div>
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-[#e0e0e0] bg-[#f0f0f0] px-4 py-2 text-sm font-semibold text-[#333]"
                  >
                    Clear Form
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Send Message
                  </button>
                </div>
                {contactSent ? (
                  <p className="mt-3 text-sm font-semibold text-[#27ae60]">
                    Message sent successfully. We&apos;ll get back to you within 24 hours. Ticket{" "}
                    {ticket}
                  </p>
                ) : null}
              </form>
              <aside className="rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <h3 className="text-[18px] font-bold text-[#1a1a1a]">Support Contact Info</h3>
                <div className="mt-3 space-y-2 text-sm text-[#666]">
                  <p>
                    Email:{" "}
                    <a
                      href="mailto:support@storefront.com"
                      className="text-[#008080] hover:underline"
                    >
                      support@storefront.com
                    </a>
                  </p>
                  <p>
                    Phone:{" "}
                    <a href="tel:+15551234567" className="text-[#008080] hover:underline">
                      +1 (555) 123-4567
                    </a>
                  </p>
                  <p>Hours: Monday-Friday 9AM-6PM EST</p>
                  <p>Response time: Average 2 hours</p>
                </div>
                <button
                  type="button"
                  className="mt-4 rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
                >
                  Start live chat
                </button>
              </aside>
            </section>
          ) : null}

          {tab === "status" ? (
            <section className="mt-4 rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <h2 className="text-[24px] font-bold text-[#1a1a1a]">System Status</h2>
              <p className="mt-1 text-xs text-[#999]">Last updated 5 minutes ago</p>
              <a
                href="https://status.storefront.com"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm font-semibold text-[#008080] hover:underline"
              >
                Check status.storefront.com
              </a>
              <div className="mt-4 space-y-2">
                {[
                  ["API", "Operational", "success"],
                  ["Dashboard", "Operational", "success"],
                  ["Payments", "Degraded Performance", "warning"],
                  ["Email Delivery", "Operational", "success"]
                ].map(([service, state, type]) => (
                  <div
                    key={service}
                    className="flex items-center justify-between rounded-lg border border-[#e0e0e0] p-3 text-sm"
                  >
                    <span className="font-semibold text-[#1a1a1a]">{service}</span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-semibold",
                        type === "success" ? "bg-[#27ae60] text-white" : "bg-[#f59e0b] text-white"
                      )}
                    >
                      {state}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>

      {articleOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-3xl font-bold text-[#008080]">{articleOpen}</h3>
              <button
                type="button"
                onClick={() => setArticleOpen(null)}
                className="rounded p-1 text-[#666] hover:bg-[#f5f5f5]"
              >
                <MdClose size={20} />
              </button>
            </div>
            <p className="text-xs text-[#999]">By Support Team • Mar 10, 2024 • 5 min read</p>
            <p className="mt-4 text-sm text-[#666]">
              This is the article reader view. Add your full rich-text article content, images, and
              related sections here.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm"
              >
                👍 Helpful
              </button>
              <button
                type="button"
                className="rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm"
              >
                👎 Not helpful
              </button>
              <button
                type="button"
                className="rounded-lg border border-[#008080] px-3 py-2 text-sm text-[#008080]"
              >
                Copy link
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
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
