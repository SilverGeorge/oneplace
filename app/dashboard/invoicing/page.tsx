"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  MdClose,
  MdDelete,
  MdDownload,
  MdEdit,
  MdMenu,
  MdSend,
  MdVisibility
} from "react-icons/md";
import { cn } from "@/lib/cn";
import { SidebarMenu, withPreviewParam } from "@/components/dashboard/SidebarMenu";
import { usePreviewMode } from "@/hooks/use-preview-mode";

type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled";
type Invoice = {
  id: string;
  customer: string;
  email: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: Array<{ description: string; qty: number; unitPrice: number }>;
  notes?: string;
  terms?: string;
  paymentInstructions?: string;
};

const seedInvoices: Invoice[] = [
  {
    id: "INV-2024-001",
    customer: "John Doe",
    email: "john@example.com",
    amount: 1250,
    issueDate: "Mar 10, 2024",
    dueDate: "Mar 25, 2024",
    status: "Sent",
    items: [{ description: "Website redesign", qty: 1, unitPrice: 1250 }]
  },
  {
    id: "INV-2024-002",
    customer: "Sarah Jones",
    email: "sarah@example.com",
    amount: 320,
    issueDate: "Mar 11, 2024",
    dueDate: "Mar 26, 2024",
    status: "Draft",
    items: [{ description: "Social media assets", qty: 4, unitPrice: 80 }]
  },
  {
    id: "INV-2024-003",
    customer: "Acme Corp",
    email: "billing@acme.com",
    amount: 890,
    issueDate: "Mar 01, 2024",
    dueDate: "Mar 15, 2024",
    status: "Overdue",
    items: [{ description: "Monthly retainers", qty: 1, unitPrice: 890 }]
  }
];

type Tab = "all" | "create" | "templates";

export default function InvoicingPage() {
  const pathname = usePathname() ?? "/dashboard/invoicing";
  const isPreviewMode = usePreviewMode();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [dateRange, setDateRange] = useState("Last 30 days");
  const [amountRange, setAmountRange] = useState("All");
  const [sort, setSort] = useState("Newest first");
  const [selected, setSelected] = useState<string[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>(seedInvoices);
  const [viewing, setViewing] = useState<Invoice | null>(null);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [sending, setSending] = useState<Invoice | null>(null);
  const [deleting, setDeleting] = useState<Invoice | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [createItems, setCreateItems] = useState<
    Array<{ description: string; qty: number; unitPrice: number }>
  >([{ description: "", qty: 1, unitPrice: 0 }]);
  const [tax, setTax] = useState(0);
  const [shipping, setShipping] = useState(0);
  const subtotal = createItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const total = subtotal + (subtotal * tax) / 100 + shipping;

  const filtered = useMemo(() => {
    let rows = invoices.filter((row) =>
      [row.id, row.customer, row.email].join(" ").toLowerCase().includes(query.toLowerCase())
    );
    if (status !== "All") rows = rows.filter((row) => row.status === status);
    if (amountRange === "Under $100") rows = rows.filter((row) => row.amount < 100);
    if (amountRange === "$100-500")
      rows = rows.filter((row) => row.amount >= 100 && row.amount <= 500);
    if (amountRange === "$500+") rows = rows.filter((row) => row.amount > 500);
    if (dateRange === "Last 7 days")
      rows = rows.slice(0, Math.max(1, Math.ceil(rows.length * 0.25)));
    if (dateRange === "Last 30 days")
      rows = rows.slice(0, Math.max(1, Math.ceil(rows.length * 0.6)));
    if (dateRange === "Last 90 days")
      rows = rows.slice(0, Math.max(1, Math.ceil(rows.length * 0.9)));
    rows = [...rows].sort((a, b) => {
      if (sort === "Oldest first") return a.id.localeCompare(b.id);
      if (sort === "Highest amount") return b.amount - a.amount;
      if (sort === "Lowest amount") return a.amount - b.amount;
      return b.id.localeCompare(a.id);
    });
    return rows;
  }, [invoices, query, status, amountRange, dateRange, sort]);

  function toggleRow(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  function applyBulk(action: "paid" | "reminder" | "delete") {
    if (action === "paid") {
      setInvoices((prev) =>
        prev.map((row) => (selected.includes(row.id) ? { ...row, status: "Paid" } : row))
      );
      setToast("Invoices marked as paid");
    }
    if (action === "reminder") {
      setToast("Reminder emails sent");
    }
    if (action === "delete") {
      setInvoices((prev) => prev.filter((row) => !selected.includes(row.id)));
      setToast("Invoices deleted");
    }
    setSelected([]);
  }

  function exportCsv() {
    const header = "Invoice,Customer,Amount,Issue Date,Due Date,Status\n";
    const body = filtered
      .map(
        (row) =>
          `${row.id},${row.customer},${row.amount.toFixed(2)},${row.issueDate},${row.dueDate},${row.status}`
      )
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "invoices.csv";
    a.click();
    URL.revokeObjectURL(url);
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
            &gt; Invoicing
          </nav>
          <h1 className="mt-2 text-[40px] font-bold text-[#008080]">Invoicing</h1>
          <p className="text-sm text-[#666]">Create, manage, and track invoices</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Invoices" },
              { id: "create", label: "Create Invoice" },
              { id: "templates", label: "Templates" }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as Tab)}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm font-semibold transition",
                  activeTab === tab.id
                    ? "border-[#008080] bg-[#008080] text-white"
                    : "border-[#e0e0e0] text-[#333] hover:bg-[#f0fffe]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "all" ? (
            <>
              <section className="mt-4 rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <div className="grid gap-2 md:grid-cols-6">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by invoice number, customer name..."
                    className={inputClass}
                  />
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={inputClass}
                  >
                    {["All", "Draft", "Sent", "Paid", "Overdue", "Cancelled"].map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className={inputClass}
                  >
                    {["Last 7 days", "Last 30 days", "Last 90 days", "Custom"].map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  <select
                    value={amountRange}
                    onChange={(e) => setAmountRange(e.target.value)}
                    className={inputClass}
                  >
                    {["All", "Under $100", "$100-500", "$500+"].map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className={inputClass}
                  >
                    {["Newest first", "Oldest first", "Highest amount", "Lowest amount"].map(
                      (item) => (
                        <option key={item}>{item}</option>
                      )
                    )}
                  </select>
                  <button
                    type="button"
                    onClick={exportCsv}
                    className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Export CSV
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyBulk("paid")}
                    className="rounded-lg border border-[#e0e0e0] px-3 py-2 text-xs font-semibold text-[#333]"
                  >
                    Mark as paid
                  </button>
                  <button
                    type="button"
                    onClick={() => applyBulk("reminder")}
                    className="rounded-lg border border-[#e0e0e0] px-3 py-2 text-xs font-semibold text-[#333]"
                  >
                    Send reminder
                  </button>
                  <button
                    type="button"
                    onClick={() => applyBulk("delete")}
                    className="rounded-lg bg-[#e74c3c] px-3 py-2 text-xs font-semibold text-white"
                  >
                    Delete
                  </button>
                </div>
              </section>

              <section className="mt-4 overflow-hidden rounded-xl border border-[#e0e0e0] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                {filtered.length === 0 ? (
                  <div className="p-10 text-center">
                    <div className="mx-auto h-16 w-16 rounded-full bg-[#f1f1f1]" />
                    <h2 className="mt-3 text-2xl font-bold text-[#1a1a1a]">No invoices yet</h2>
                    <p className="mt-1 text-sm text-[#666]">
                      Create your first invoice to get started
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("create")}
                      className="mt-3 rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
                    >
                      Create Invoice
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[1080px] text-left">
                        <thead className="bg-[#f5f5f5] text-sm font-bold text-[#333]">
                          <tr>
                            <th className="px-4 py-3" />
                            {[
                              "Invoice #",
                              "Customer",
                              "Amount",
                              "Issue Date",
                              "Due Date",
                              "Status",
                              "Actions"
                            ].map((head) => (
                              <th key={head} className="px-4 py-3">
                                {head}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.slice(0, 10).map((invoice) => (
                            <tr
                              key={invoice.id}
                              className="group h-14 border-t border-[#f0f0f0] text-sm text-[#666] hover:bg-[#f8fffe]"
                            >
                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  checked={selected.includes(invoice.id)}
                                  onChange={() => toggleRow(invoice.id)}
                                  className="h-4 w-4 accent-[#008080]"
                                />
                              </td>
                              <td className="px-4 py-3 font-bold text-[#008080]">
                                <button
                                  type="button"
                                  onClick={() => setViewing(invoice)}
                                  className="hover:underline"
                                >
                                  #{invoice.id}
                                </button>
                              </td>
                              <td className="px-4 py-3">{invoice.customer}</td>
                              <td className="px-4 py-3 font-bold text-[#008080]">
                                ${invoice.amount.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-xs text-[#999]">{invoice.issueDate}</td>
                              <td className="px-4 py-3 text-xs text-[#999]">{invoice.dueDate}</td>
                              <td className="px-4 py-3">
                                <span className={invoiceBadge(invoice.status)}>
                                  {invoice.status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                                  <IconButton
                                    label="View invoice"
                                    onClick={() => setViewing(invoice)}
                                  >
                                    <MdVisibility size={18} />
                                  </IconButton>
                                  <IconButton
                                    label="Edit invoice"
                                    onClick={() => setEditing(invoice)}
                                  >
                                    <MdEdit size={18} />
                                  </IconButton>
                                  <IconButton
                                    label="Send invoice"
                                    onClick={() => setSending(invoice)}
                                  >
                                    <MdSend size={18} />
                                  </IconButton>
                                  <IconButton
                                    label="Download invoice"
                                    onClick={() => setToast(`${invoice.id}.pdf downloaded`)}
                                  >
                                    <MdDownload size={18} />
                                  </IconButton>
                                  <IconButton
                                    label="Delete invoice"
                                    danger
                                    onClick={() => setDeleting(invoice)}
                                  >
                                    <MdDelete size={18} />
                                  </IconButton>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex justify-end p-3 text-sm text-[#666]">
                      Showing 1-10 of {filtered.length} invoices
                    </div>
                  </>
                )}
              </section>
            </>
          ) : null}

          {activeTab === "create" ? (
            <section className="mt-4 rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <h2 className="text-[28px] font-bold text-[#1a1a1a]">Create New Invoice</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Field label="Invoice Number">
                  <input value="INV-2024-001" readOnly className={`${inputClass} bg-[#f9f9f9]`} />
                </Field>
                <Field label="Issue Date">
                  <input type="date" className={inputClass} />
                </Field>
                <Field label="Due Date">
                  <input type="date" className={inputClass} />
                </Field>
                <Field label="Status">
                  <select className={inputClass}>
                    {["Draft", "Sent", "Paid"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <h3 className="mt-6 text-[18px] font-bold">Customer Information</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <Field label="Customer">
                  <input className={inputClass} placeholder="Select customer" />
                </Field>
                <Field label="Customer email">
                  <input className={inputClass} placeholder="customer@email.com" />
                </Field>
                <Field label="Customer phone">
                  <input className={inputClass} placeholder="+1 (555)..." />
                </Field>
                <Field label="Billing address">
                  <input className={inputClass} placeholder="Address" />
                </Field>
              </div>

              <h3 className="mt-6 text-[18px] font-bold">Invoice Items</h3>
              <div className="mt-2 space-y-2">
                {createItems.map((item, idx) => (
                  <div key={idx} className="grid gap-2 md:grid-cols-[1fr_120px_140px_120px_60px]">
                    <input
                      value={item.description}
                      onChange={(e) =>
                        setCreateItems((prev) =>
                          prev.map((row, i) =>
                            i === idx ? { ...row, description: e.target.value } : row
                          )
                        )
                      }
                      placeholder="Product/Service name"
                      className={inputClass}
                    />
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) =>
                        setCreateItems((prev) =>
                          prev.map((row, i) =>
                            i === idx ? { ...row, qty: Number(e.target.value) } : row
                          )
                        )
                      }
                      className={inputClass}
                    />
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) =>
                        setCreateItems((prev) =>
                          prev.map((row, i) =>
                            i === idx ? { ...row, unitPrice: Number(e.target.value) } : row
                          )
                        )
                      }
                      className={inputClass}
                    />
                    <input
                      value={`$${(item.qty * item.unitPrice).toFixed(2)}`}
                      readOnly
                      className={`${inputClass} bg-[#f9f9f9]`}
                    />
                    <button
                      type="button"
                      onClick={() => setCreateItems((prev) => prev.filter((_, i) => i !== idx))}
                      className="rounded-lg border border-[#e0e0e0] text-sm"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setCreateItems((prev) => [...prev, { description: "", qty: 1, unitPrice: 0 }])
                }
                className="mt-3 rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
              >
                + Add Item
              </button>

              <h3 className="mt-6 text-[18px] font-bold">Totals</h3>
              <div className="mt-2 grid gap-2 md:grid-cols-4">
                <Field label="Subtotal">
                  <input
                    value={`$${subtotal.toFixed(2)}`}
                    readOnly
                    className={`${inputClass} bg-[#f9f9f9]`}
                  />
                </Field>
                <Field label="Tax/VAT %">
                  <input
                    type="number"
                    value={tax}
                    onChange={(e) => setTax(Number(e.target.value))}
                    className={inputClass}
                  />
                </Field>
                <Field label="Shipping">
                  <input
                    type="number"
                    value={shipping}
                    onChange={(e) => setShipping(Number(e.target.value))}
                    className={inputClass}
                  />
                </Field>
                <Field label="Total">
                  <input
                    value={`$${total.toFixed(2)}`}
                    readOnly
                    className={`${inputClass} bg-[#f9f9f9] font-bold text-[#008080]`}
                  />
                </Field>
              </div>

              <h3 className="mt-6 text-[18px] font-bold">Notes & Terms</h3>
              <div className="mt-2 grid gap-3 md:grid-cols-3">
                <Field label="Notes">
                  <textarea rows={3} className={inputClass} />
                </Field>
                <Field label="Terms">
                  <textarea rows={3} className={inputClass} />
                </Field>
                <Field label="Payment instructions">
                  <textarea rows={3} className={inputClass} />
                </Field>
              </div>

              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setToast("Invoice saved as draft")}
                  className="rounded-lg border border-[#e0e0e0] bg-[#f0f0f0] px-4 py-2 text-sm font-semibold text-[#333]"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => setToast("Invoice sent to customer@email.com")}
                  className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
                >
                  Send Invoice
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-[#e0e0e0] bg-white px-4 py-2 text-sm font-semibold text-[#666]"
                >
                  Cancel
                </button>
              </div>
            </section>
          ) : null}

          {activeTab === "templates" ? (
            <section className="mt-4 rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <div className="flex items-center justify-between">
                <h2 className="text-[28px] font-bold text-[#1a1a1a]">Invoice Templates</h2>
                <button
                  type="button"
                  className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
                >
                  + Create Custom Template
                </button>
              </div>
              <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  "Standard Invoice",
                  "Professional Invoice",
                  "Minimal Invoice",
                  "Detailed Invoice"
                ].map((tpl) => (
                  <article
                    key={tpl}
                    className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm"
                  >
                    <div className="h-32 rounded-lg bg-[#f5f5f5]" />
                    <h3 className="mt-3 text-sm font-bold text-[#1a1a1a]">{tpl}</h3>
                    <p className="text-xs text-[#999]">Professional standard template</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        className="rounded-lg bg-[#008080] px-3 py-2 text-xs font-semibold text-white"
                      >
                        Use Template
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-[#e0e0e0] px-3 py-2 text-xs font-semibold text-[#333]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-[#e74c3c] px-3 py-2 text-xs font-semibold text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>

      {viewing ? (
        <Modal title={`Invoice #${viewing.id}`} onClose={() => setViewing(null)}>
          <p className="text-sm text-[#666]">Customer: {viewing.customer}</p>
          <p className="text-sm text-[#666]">Amount: ${viewing.amount.toFixed(2)}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg border border-[#008080] px-3 py-2 text-sm font-semibold text-[#008080]"
            >
              Download PDF
            </button>
            <button
              type="button"
              className="rounded-lg bg-[#008080] px-3 py-2 text-sm font-semibold text-white"
            >
              Send Email
            </button>
            {viewing.status !== "Paid" ? (
              <button
                type="button"
                className="rounded-lg bg-[#27ae60] px-3 py-2 text-sm font-semibold text-white"
              >
                Mark as paid
              </button>
            ) : null}
          </div>
        </Modal>
      ) : null}

      {editing ? (
        <Modal title={`Edit Invoice #${editing.id}`} onClose={() => setEditing(null)}>
          {editing.status !== "Draft" ? (
            <p className="rounded-lg bg-[#fff8e6] p-3 text-sm text-[#b45309]">
              Only Draft invoices are editable.
            </p>
          ) : (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#333]">
                Status
                <select
                  value={editing.status}
                  onChange={(e) =>
                    setEditing({ ...editing, status: e.target.value as InvoiceStatus })
                  }
                  className={`${inputClass} mt-1`}
                >
                  {["Draft", "Sent", "Paid", "Overdue", "Cancelled"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-bold text-[#333]">
                Tracking number
                <input
                  className={`${inputClass} mt-1`}
                  value={editing.notes ?? ""}
                  onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-lg border border-[#e0e0e0] bg-[#f0f0f0] px-4 py-2 text-sm font-semibold text-[#333]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setToast("Invoice updated");
                  }}
                  className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </Modal>
      ) : null}

      {sending ? (
        <Modal title={`Send Invoice #${sending.id}`} onClose={() => setSending(null)}>
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#333]">
              Email
              <input value={sending.email} className={`${inputClass} mt-1`} readOnly />
            </label>
            <label className="block text-xs font-bold text-[#333]">
              Subject
              <input className={`${inputClass} mt-1`} placeholder="Invoice from Storefront" />
            </label>
            <label className="block text-xs font-bold text-[#333]">
              Message
              <textarea rows={3} className={`${inputClass} mt-1`} />
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSending(null)}
                className="rounded-lg border border-[#e0e0e0] bg-[#f0f0f0] px-4 py-2 text-sm font-semibold text-[#333]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setSending(null);
                  setToast("Invoice sent to customer");
                }}
                className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
              >
                Send
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {deleting ? (
        <Modal title="Delete invoice?" onClose={() => setDeleting(null)}>
          <p className="text-sm text-[#666]">
            Delete invoice #{deleting.id}? This cannot be undone.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleting(null)}
              className="rounded-lg border border-[#e0e0e0] bg-[#f0f0f0] px-4 py-2 text-sm font-semibold text-[#333]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setInvoices((prev) => prev.filter((item) => item.id !== deleting.id));
                setDeleting(null);
                setToast("Invoice deleted successfully");
              }}
              className="rounded-lg bg-[#e74c3c] px-4 py-2 text-sm font-semibold text-white"
            >
              Delete
            </button>
          </div>
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

function invoiceBadge(status: InvoiceStatus): string {
  return cn(
    "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
    status === "Draft" && "bg-[#e0e0e0] text-[#333]",
    status === "Sent" && "bg-[#3b82f6] text-white",
    status === "Paid" && "bg-[#27ae60] text-white",
    status === "Overdue" && "bg-[#e74c3c] text-white",
    status === "Cancelled" && "bg-[#9ca3af] text-white"
  );
}

function IconButton({
  label,
  onClick,
  children,
  danger
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "rounded p-2 transition",
        danger ? "text-[#e74c3c] hover:bg-[#fdecea]" : "text-[#008080] hover:bg-[#e6fbf9]"
      )}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs font-bold text-[#333]">{label}</span>
      {children}
    </label>
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
