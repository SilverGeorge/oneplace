"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MdChat, MdDelete, MdEdit, MdMenu, MdVisibility, MdClose } from "react-icons/md";
import { apiRequest } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { SidebarMenu, withPreviewParam } from "@/components/dashboard/SidebarMenu";
import { usePreviewMode } from "@/hooks/use-preview-mode";

type CustomerStatus = "Active" | "Inactive" | "Blocked";
type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  orders: number;
  totalSpent: number;
  lastOrder: string;
  status: CustomerStatus;
  address?: string;
};

export default function CustomersPage() {
  const pathname = usePathname() ?? "/dashboard/customers";
  const isPreviewMode = usePreviewMode();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [joinFilter, setJoinFilter] = useState("All");
  const [spentFilter, setSpentFilter] = useState("All");
  const [ordersFilter, setOrdersFilter] = useState("All");
  const [sort, setSort] = useState("Newest first");
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [messageCustomer, setMessageCustomer] = useState<Customer | null>(null);
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest<{ items: Customer[] }>("/api/customers");
        setCustomers(res.data.items);
      } catch (error) {
        setToast({
          type: "error",
          message: error instanceof Error ? error.message : "Failed to load customers"
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
    let rows = customers.filter((c) => {
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
      );
    });

    if (statusFilter !== "All") rows = rows.filter((row) => row.status === statusFilter);
    if (joinFilter === "Last 7 days")
      rows = rows.slice(0, Math.max(1, Math.ceil(rows.length * 0.3)));
    if (joinFilter === "Last 30 days")
      rows = rows.slice(0, Math.max(1, Math.ceil(rows.length * 0.6)));
    if (joinFilter === "Last 90 days")
      rows = rows.slice(0, Math.max(1, Math.ceil(rows.length * 0.9)));
    if (spentFilter === "Under $100") rows = rows.filter((row) => row.totalSpent < 100);
    if (spentFilter === "$100-500")
      rows = rows.filter((row) => row.totalSpent >= 100 && row.totalSpent <= 500);
    if (spentFilter === "$500+") rows = rows.filter((row) => row.totalSpent > 500);
    if (ordersFilter === "1 order") rows = rows.filter((row) => row.orders === 1);
    if (ordersFilter === "2-5 orders")
      rows = rows.filter((row) => row.orders >= 2 && row.orders <= 5);
    if (ordersFilter === "5+ orders") rows = rows.filter((row) => row.orders > 5);
    rows = [...rows].sort((a, b) => {
      if (sort === "Most orders") return b.orders - a.orders;
      if (sort === "Highest spent") return b.totalSpent - a.totalSpent;
      if (sort === "Alphabetical") return a.name.localeCompare(b.name);
      return b.id.localeCompare(a.id);
    });
    return rows;
  }, [customers, query, statusFilter, spentFilter, ordersFilter, sort, joinFilter]);

  async function saveCustomer() {
    if (!editCustomer) return;
    try {
      await apiRequest<{ message: string }>(`/api/customers/${editCustomer.id}`, {
        method: "PUT",
        body: JSON.stringify(editCustomer)
      });
      setCustomers((prev) => prev.map((c) => (c.id === editCustomer.id ? editCustomer : c)));
      setEditCustomer(null);
      setToast({ type: "success", message: "Customer updated successfully" });
    } catch {
      setToast({ type: "error", message: "Could not update customer" });
    }
  }

  async function confirmDelete() {
    if (!deleteCustomer) return;
    try {
      await apiRequest<{ message: string }>(`/api/customers/${deleteCustomer.id}`, {
        method: "DELETE"
      });
      setCustomers((prev) => prev.filter((c) => c.id !== deleteCustomer.id));
      setDeleteCustomer(null);
      setToast({ type: "success", message: "Customer deleted successfully" });
    } catch {
      setToast({ type: "error", message: "Could not delete customer" });
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
          </div>
          <nav className="mt-2 text-sm text-[#666]" aria-label="Breadcrumb">
            <Link
              href={withPreviewParam("/dashboard", isPreviewMode)}
              className="text-[#008080] hover:underline"
            >
              Dashboard
            </Link>{" "}
            &gt; Customer List
          </nav>
          <h1 className="mt-2 text-[40px] font-bold text-[#008080]">Customers</h1>
          <p className="text-sm text-[#666]">Manage your customer relationships</p>

          <section className="mt-4 rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="grid gap-2 md:grid-cols-6">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email, phone..."
                className={inputClass}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={inputClass}
              >
                {["All", "Active", "Inactive", "Blocked"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <select
                value={joinFilter}
                onChange={(e) => setJoinFilter(e.target.value)}
                className={inputClass}
              >
                {["All", "Last 7 days", "Last 30 days", "Last 90 days"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <select
                value={spentFilter}
                onChange={(e) => setSpentFilter(e.target.value)}
                className={inputClass}
              >
                {["All", "Under $100", "$100-500", "$500+"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <select
                value={ordersFilter}
                onChange={(e) => setOrdersFilter(e.target.value)}
                className={inputClass}
              >
                {["All", "1 order", "2-5 orders", "5+ orders"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className={inputClass}
                >
                  {["Newest first", "Most orders", "Highest spent", "Alphabetical"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
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
                <h2 className="text-2xl font-bold text-[#1a1a1a]">No customers yet</h2>
                <p className="mt-1 text-sm text-[#666]">
                  Your customer list will appear here as customers place orders
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] text-left">
                    <thead className="bg-[#f5f5f5] text-sm font-bold text-[#333]">
                      <tr>
                        {[
                          "Customer",
                          "Email",
                          "Phone",
                          "Orders",
                          "Total Spent",
                          "Last Order",
                          "Status",
                          "Actions"
                        ].map((h) => (
                          <th key={h} className="px-4 py-3">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.slice(0, 10).map((customer) => (
                        <tr
                          key={customer.id}
                          className="group h-16 border-t border-[#f0f0f0] text-sm text-[#666] hover:bg-[#f8fffe]"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Image
                                src={customer.avatar}
                                alt={customer.name}
                                width={32}
                                height={32}
                                unoptimized
                                className="rounded-full object-cover"
                              />
                              <span className="font-semibold text-[#1a1a1a]">{customer.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <a
                              href={`mailto:${customer.email}`}
                              className="text-[#008080] hover:underline"
                            >
                              {customer.email}
                            </a>
                          </td>
                          <td className="px-4 py-3">{customer.phone}</td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              className="text-xs text-[#3b82f6] hover:underline"
                            >
                              {customer.orders} orders
                            </button>
                          </td>
                          <td className="px-4 py-3 font-bold text-[#008080]">
                            ${customer.totalSpent.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-xs text-[#999]">{customer.lastOrder}</td>
                          <td className="px-4 py-3">
                            <span className={statusBadge(customer.status)}>{customer.status}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                              <IconButton
                                title="View customer"
                                onClick={() => setViewCustomer(customer)}
                                color="teal"
                              >
                                <MdVisibility size={18} />
                              </IconButton>
                              <IconButton
                                title="Edit customer"
                                onClick={() => setEditCustomer(customer)}
                                color="teal"
                              >
                                <MdEdit size={18} />
                              </IconButton>
                              <IconButton
                                title="Message customer"
                                onClick={() => setMessageCustomer(customer)}
                                color="teal"
                              >
                                <MdChat size={18} />
                              </IconButton>
                              <IconButton
                                title="Delete customer"
                                onClick={() => setDeleteCustomer(customer)}
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
                  Showing 1-10 of {filtered.length} customers
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      {viewCustomer ? (
        <Modal title={viewCustomer.name} onClose={() => setViewCustomer(null)}>
          <div className="space-y-2 text-sm text-[#666]">
            <p>
              <span className="font-semibold text-[#1a1a1a]">Email:</span> {viewCustomer.email}
            </p>
            <p>
              <span className="font-semibold text-[#1a1a1a]">Phone:</span> {viewCustomer.phone}
            </p>
            <p>
              <span className="font-semibold text-[#1a1a1a]">Address:</span>{" "}
              {viewCustomer.address ?? "Not provided"}
            </p>
            <p>
              <span className="font-semibold text-[#1a1a1a]">Orders:</span> {viewCustomer.orders}
            </p>
            <p>
              <span className="font-semibold text-[#1a1a1a]">Total spent:</span> $
              {viewCustomer.totalSpent.toFixed(2)}
            </p>
          </div>
        </Modal>
      ) : null}

      {editCustomer ? (
        <Modal title={`Edit ${editCustomer.name}`} onClose={() => setEditCustomer(null)}>
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#333]">
              Name
              <input
                value={editCustomer.name}
                onChange={(e) => setEditCustomer({ ...editCustomer, name: e.target.value })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="block text-xs font-bold text-[#333]">
              Email
              <input
                value={editCustomer.email}
                onChange={(e) => setEditCustomer({ ...editCustomer, email: e.target.value })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="block text-xs font-bold text-[#333]">
              Phone
              <input
                value={editCustomer.phone}
                onChange={(e) => setEditCustomer({ ...editCustomer, phone: e.target.value })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="block text-xs font-bold text-[#333]">
              Address
              <input
                value={editCustomer.address ?? ""}
                onChange={(e) => setEditCustomer({ ...editCustomer, address: e.target.value })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="block text-xs font-bold text-[#333]">
              Status
              <select
                value={editCustomer.status}
                onChange={(e) =>
                  setEditCustomer({ ...editCustomer, status: e.target.value as CustomerStatus })
                }
                className={`${inputClass} mt-1`}
              >
                {["Active", "Inactive", "Blocked"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditCustomer(null)}
              className="rounded-lg border border-[#e0e0e0] bg-[#f0f0f0] px-4 py-2 text-sm font-semibold text-[#333]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void saveCustomer()}
              className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
            >
              Save
            </button>
          </div>
        </Modal>
      ) : null}

      {messageCustomer ? (
        <Modal title={`Message ${messageCustomer.name}`} onClose={() => setMessageCustomer(null)}>
          <textarea rows={4} placeholder="Write message..." className={inputClass} />
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setMessageCustomer(null)}
              className="rounded-lg border border-[#e0e0e0] bg-[#f0f0f0] px-4 py-2 text-sm font-semibold text-[#333]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setMessageCustomer(null);
                setToast({ type: "success", message: "Message sent successfully" });
              }}
              className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
            >
              Send
            </button>
          </div>
        </Modal>
      ) : null}

      {deleteCustomer ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-2xl font-bold text-[#1a1a1a]">Delete customer profile?</h3>
            <p className="mt-2 text-sm text-[#666]">Orders will be preserved.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteCustomer(null)}
                className="rounded-lg border border-[#e0e0e0] bg-[#f0f0f0] px-4 py-2 text-sm font-semibold text-[#333]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmDelete()}
                className="rounded-lg bg-[#e74c3c] px-4 py-2 text-sm font-semibold text-white"
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

function statusBadge(status: CustomerStatus): string {
  return cn(
    "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
    status === "Active" && "bg-[#27ae60] text-white",
    status === "Inactive" && "bg-[#e5e7eb] text-[#374151]",
    status === "Blocked" && "bg-[#e74c3c] text-white"
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
        color === "teal" ? "text-[#008080] hover:bg-[#e6fbf9]" : "text-[#e74c3c] hover:bg-[#fdecea]"
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
