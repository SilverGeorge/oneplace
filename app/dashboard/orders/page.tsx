"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MdDelete, MdEdit, MdMenu, MdVisibility, MdClose, MdWarningAmber } from "react-icons/md";
import { apiRequest } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { SidebarMenu, withPreviewParam } from "@/components/dashboard/SidebarMenu";

type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
type Order = {
  id: string;
  customer: string;
  email: string;
  amount: number;
  items: number;
  status: OrderStatus;
  date: string;
  trackingNumber?: string;
  notes?: string;
  shippingAddress?: string;
};

export default function OrdersPage() {
  const pathname = usePathname() ?? "/dashboard/orders";
  const searchParams = useSearchParams();
  const isPreviewMode = searchParams?.get("preview") === "1";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("Last 30 days");
  const [amountFilter, setAmountFilter] = useState("All");
  const [sort, setSort] = useState("Newest first");
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [deleteOrder, setDeleteOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest<{ items: Order[] }>("/api/orders");
        setOrders(res.data.items);
      } catch (error) {
        setToast({
          type: "error",
          message: error instanceof Error ? error.message : "Failed to load orders"
        });
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    let rows = orders.filter((order) => {
      if (!q) return true;
      return (
        order.id.toLowerCase().includes(q) ||
        order.customer.toLowerCase().includes(q) ||
        order.email.toLowerCase().includes(q)
      );
    });

    if (statusFilter !== "All") rows = rows.filter((row) => row.status === statusFilter);
    if (dateFilter === "Last 7 days")
      rows = rows.slice(0, Math.max(1, Math.ceil(rows.length * 0.3)));
    if (dateFilter === "Last 30 days")
      rows = rows.slice(0, Math.max(1, Math.ceil(rows.length * 0.6)));
    if (dateFilter === "Last 90 days")
      rows = rows.slice(0, Math.max(1, Math.ceil(rows.length * 0.9)));
    if (amountFilter === "Under $100") rows = rows.filter((row) => row.amount < 100);
    if (amountFilter === "$100-500")
      rows = rows.filter((row) => row.amount >= 100 && row.amount <= 500);
    if (amountFilter === "$500+") rows = rows.filter((row) => row.amount > 500);

    rows = [...rows].sort((a, b) => {
      if (sort === "Oldest first") return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sort === "Highest amount") return b.amount - a.amount;
      if (sort === "Lowest amount") return a.amount - b.amount;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    return rows;
  }, [orders, query, statusFilter, amountFilter, sort, dateFilter]);

  function exportCsv() {
    const header = "Order ID,Customer,Email,Amount,Items,Status,Date\n";
    const body = filtered
      .map(
        (o) =>
          `${o.id},${o.customer},${o.email},${o.amount.toFixed(2)},${o.items},${o.status},${o.date}`
      )
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function saveOrder() {
    if (!editOrder) return;
    try {
      await apiRequest<{ message: string }>(`/api/orders/${editOrder.id}`, {
        method: "PUT",
        body: JSON.stringify(editOrder)
      });
      setOrders((prev) => prev.map((o) => (o.id === editOrder.id ? editOrder : o)));
      setEditOrder(null);
      setToast({ type: "success", message: "Order updated successfully" });
    } catch {
      setToast({ type: "error", message: "Could not update order" });
    }
  }

  async function confirmDelete() {
    if (!deleteOrder) return;
    try {
      await apiRequest<{ message: string }>(`/api/orders/${deleteOrder.id}`, { method: "DELETE" });
      setOrders((prev) => prev.filter((o) => o.id !== deleteOrder.id));
      setDeleteOrder(null);
      setToast({ type: "success", message: "Order deleted successfully" });
    } catch {
      setToast({ type: "error", message: "Could not delete order" });
    }
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
          <div className="flex items-center gap-3 md:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded p-2 text-[#008080] hover:bg-[#f0fffe]"
              aria-label="Open menu"
            >
              <MdMenu size={24} />
            </button>
            <p className="text-sm text-[#666]">Menu</p>
          </div>

          <nav className="mt-2 text-sm text-[#666]" aria-label="Breadcrumb">
            <Link
              href={withPreviewParam("/dashboard", isPreviewMode)}
              className="text-[#008080] hover:underline"
            >
              Dashboard
            </Link>{" "}
            &gt; Order List
          </nav>
          <h1 className="mt-2 text-[40px] font-bold text-[#008080]">Orders</h1>
          <p className="text-sm text-[#666]">Manage and track all your orders</p>

          <section className="mt-4 rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="grid gap-2 md:grid-cols-5">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by order ID, customer name, email..."
                className={inputClass}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={inputClass}
              >
                {["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className={inputClass}
              >
                {["Last 7 days", "Last 30 days", "Last 90 days", "Custom date"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <select
                value={amountFilter}
                onChange={(e) => setAmountFilter(e.target.value)}
                className={inputClass}
              >
                {["All", "Under $100", "$100-500", "$500+"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className={inputClass}
                >
                  {["Newest first", "Oldest first", "Highest amount", "Lowest amount"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={exportCsv}
                  className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0a6d6d]"
                >
                  Export CSV
                </button>
              </div>
            </div>
          </section>

          <section className="mt-4 overflow-hidden rounded-xl border border-[#e0e0e0] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            {isLoading ? (
              <div className="h-52 animate-pulse bg-[#f9f9f9]" />
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center">
                <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-[#f1f1f1]" />
                <h2 className="text-2xl font-bold text-[#1a1a1a]">No orders yet</h2>
                <p className="mt-1 text-sm text-[#666]">
                  Orders will appear here when customers place orders
                </p>
                <button
                  type="button"
                  className="mt-3 rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
                >
                  Create Test Order
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] text-left">
                    <thead className="bg-[#f5f5f5] text-sm font-bold text-[#333]">
                      <tr>
                        {[
                          "Order ID",
                          "Customer",
                          "Amount",
                          "Items",
                          "Status",
                          "Date",
                          "Actions"
                        ].map((h) => (
                          <th key={h} className="px-4 py-3">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.slice(0, 10).map((order) => (
                        <tr
                          key={order.id}
                          className="group h-14 border-t border-[#f0f0f0] text-sm text-[#666] hover:bg-[#f8fffe]"
                        >
                          <td className="px-4 py-3 font-bold text-[#008080]">
                            <button
                              type="button"
                              onClick={() => setViewOrder(order)}
                              className="hover:underline"
                            >
                              #{order.id}
                            </button>
                          </td>
                          <td className="px-4 py-3">{order.customer}</td>
                          <td className="px-4 py-3 font-bold text-[#008080]">
                            ${order.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-xs text-[#999]">{order.items} items</td>
                          <td className="px-4 py-3">
                            <span className={badgeClass(order.status)}>{order.status}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-[#999]">{order.date}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                              <IconButton
                                title="Edit order"
                                onClick={() => setEditOrder(order)}
                                color="teal"
                              >
                                <MdEdit size={18} />
                              </IconButton>
                              <IconButton
                                title="View order"
                                onClick={() => setViewOrder(order)}
                                color="teal"
                              >
                                <MdVisibility size={18} />
                              </IconButton>
                              <IconButton
                                title="Delete order"
                                onClick={() => setDeleteOrder(order)}
                                color="red"
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
                  Showing 1-10 of {filtered.length} orders
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      {editOrder ? (
        <Modal title={`Edit Order #${editOrder.id}`} onClose={() => setEditOrder(null)}>
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#333]">
              Customer (read-only)
              <input
                value={editOrder.customer}
                readOnly
                className={`${inputClass} mt-1 bg-[#f9f9f9]`}
              />
            </label>
            <label className="block text-xs font-bold text-[#333]">
              Status
              <select
                value={editOrder.status}
                onChange={(e) =>
                  setEditOrder({ ...editOrder, status: e.target.value as OrderStatus })
                }
                className={`${inputClass} mt-1`}
              >
                {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-bold text-[#333]">
              Tracking number
              <input
                value={editOrder.trackingNumber ?? ""}
                onChange={(e) => setEditOrder({ ...editOrder, trackingNumber: e.target.value })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="block text-xs font-bold text-[#333]">
              Shipping address
              <input
                value={editOrder.shippingAddress ?? ""}
                onChange={(e) => setEditOrder({ ...editOrder, shippingAddress: e.target.value })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="block text-xs font-bold text-[#333]">
              Notes
              <textarea
                value={editOrder.notes ?? ""}
                onChange={(e) => setEditOrder({ ...editOrder, notes: e.target.value })}
                className={`${inputClass} mt-1`}
                rows={3}
              />
            </label>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditOrder(null)}
              className="rounded-lg border border-[#e0e0e0] bg-[#f0f0f0] px-4 py-2 text-sm font-semibold text-[#333]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void saveOrder()}
              className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0a6d6d]"
            >
              Save
            </button>
          </div>
        </Modal>
      ) : null}

      {viewOrder ? (
        <Modal title={`Order Details #${viewOrder.id}`} onClose={() => setViewOrder(null)}>
          <div className="space-y-2 text-sm text-[#666]">
            <p>
              <span className="font-semibold text-[#1a1a1a]">Customer:</span> {viewOrder.customer}
            </p>
            <p>
              <span className="font-semibold text-[#1a1a1a]">Email:</span> {viewOrder.email}
            </p>
            <p>
              <span className="font-semibold text-[#1a1a1a]">Amount:</span> $
              {viewOrder.amount.toFixed(2)}
            </p>
            <p>
              <span className="font-semibold text-[#1a1a1a]">Items:</span> {viewOrder.items}
            </p>
            <p>
              <span className="font-semibold text-[#1a1a1a]">Status:</span> {viewOrder.status}
            </p>
            <p>
              <span className="font-semibold text-[#1a1a1a]">Shipping:</span>{" "}
              {viewOrder.shippingAddress ?? "N/A"}
            </p>
          </div>
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => setViewOrder(null)}
              className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
            >
              Back to Orders
            </button>
          </div>
        </Modal>
      ) : null}

      {deleteOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fdecea] text-[#e74c3c]">
              <MdWarningAmber size={30} />
            </div>
            <h3 className="mt-3 text-center text-2xl font-bold text-[#1a1a1a]">Delete order?</h3>
            <p className="mt-2 text-center text-sm text-[#666]">
              Delete order #{deleteOrder.id}? This cannot be undone.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteOrder(null)}
                className="rounded-lg border border-[#e0e0e0] bg-[#f0f0f0] px-4 py-2 text-sm font-semibold text-[#333]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmDelete()}
                className="rounded-lg bg-[#e74c3c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c0392b]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div
          className={cn(
            "fixed right-4 top-4 z-[60] rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-lg",
            toast.type === "success" ? "bg-[#27ae60]" : "bg-[#e74c3c]"
          )}
        >
          {toast.message}
        </div>
      ) : null}
    </main>
  );
}

function badgeClass(status: OrderStatus): string {
  return cn(
    "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
    status === "Pending" && "bg-[#fef3c7] text-[#b45309]",
    status === "Processing" && "bg-[#3b82f6] text-white",
    status === "Shipped" && "bg-[#008080] text-white",
    status === "Delivered" && "bg-[#27ae60] text-white",
    status === "Cancelled" && "bg-[#e74c3c] text-white"
  );
}

function IconButton({
  title,
  onClick,
  color,
  children
}: {
  title: string;
  onClick: () => void;
  color: "teal" | "red";
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={cn(
        "rounded p-2 transition",
        color === "teal"
          ? "text-[#008080] hover:bg-[#e6fbf9] hover:text-[#0a6d6d]"
          : "text-[#e74c3c] hover:bg-[#fdecea] hover:text-[#c0392b]"
      )}
    >
      {children}
    </button>
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
            aria-label="Close modal"
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
