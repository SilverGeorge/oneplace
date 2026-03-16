"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  MdDelete,
  MdDoNotDisturbOn,
  MdMarkEmailRead,
  MdMenu,
  MdNotificationsActive,
  MdOutlineSchedule,
  MdVisibility
} from "react-icons/md";
import { cn } from "@/lib/cn";
import { SidebarMenu, withPreviewParam } from "@/components/dashboard/SidebarMenu";
import { usePreviewMode } from "@/hooks/use-preview-mode";

type NotificationType = "orders" | "reviews" | "stock" | "payments" | "system";
type Notification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  time: string;
  read: boolean;
};

const seedNotifications: Notification[] = [
  {
    id: "n1",
    title: "New order received",
    message: "Order #ORD-2024-992 was placed by John Doe.",
    type: "orders",
    time: "5m ago",
    read: false
  },
  {
    id: "n2",
    title: "New product review",
    message: "Wireless Earbuds Pro received a 5-star review.",
    type: "reviews",
    time: "20m ago",
    read: false
  },
  {
    id: "n3",
    title: "Low stock alert",
    message: "Cotton Hoodie is below low-stock threshold.",
    type: "stock",
    time: "1h ago",
    read: true
  },
  {
    id: "n4",
    title: "Payment settled",
    message: "Payout of $1,240.90 has been deposited.",
    type: "payments",
    time: "3h ago",
    read: true
  },
  {
    id: "n5",
    title: "System update",
    message: "Webstore editor now supports menu presets.",
    type: "system",
    time: "1d ago",
    read: false
  }
];

export default function NotificationsPage() {
  const pathname = usePathname() ?? "/dashboard/notifications";
  const isPreviewMode = usePreviewMode();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState(seedNotifications);
  const [filter, setFilter] = useState<"all" | "unread" | "orders" | "reviews" | "system">("all");
  const [toast, setToast] = useState<string | null>(null);

  const [prefOrders, setPrefOrders] = useState(true);
  const [prefReviews, setPrefReviews] = useState(true);
  const [prefStock, setPrefStock] = useState(true);
  const [prefPayments, setPrefPayments] = useState(true);
  const [prefSystem, setPrefSystem] = useState(true);
  const [quietEnabled, setQuietEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("07:00");
  const [emailFrequency, setEmailFrequency] = useState("Instant");
  const [smsFrequency, setSmsFrequency] = useState("Daily");

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  const filtered = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((item) => !item.read);
    return notifications.filter((item) => item.type === filter);
  }, [notifications, filter]);

  function showToast(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(null), 2600);
  }

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
    showToast("Marked as read");
  }

  function deleteNotification(id: string) {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
    showToast("Notification deleted");
  }

  function snoozeNotification(id: string) {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, time: "Snoozed for 1 hour" } : item))
    );
    showToast("Notification snoozed");
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
            &gt; Notifications
          </nav>
          <h1 className="mt-2 text-[40px] font-bold text-[#008080]">Notifications</h1>
          <p className="text-sm text-[#666]">
            Stay up to date with store activity • Unread:{" "}
            <span className="font-semibold text-[#1a1a1a]">{unreadCount}</span>
          </p>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
            <section className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap gap-2">
                {[
                  { id: "all", label: "All" },
                  { id: "unread", label: "Unread" },
                  { id: "orders", label: "Orders" },
                  { id: "reviews", label: "Reviews" },
                  { id: "system", label: "System" }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilter(item.id as typeof filter)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm transition",
                      filter === item.id
                        ? "border-[#008080] bg-[#008080] font-semibold text-white"
                        : "border-[#e0e0e0] text-[#333] hover:bg-[#f0fffe]"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {filtered.map((notification) => (
                  <article
                    key={notification.id}
                    className={cn(
                      "rounded-xl border p-3 transition hover:bg-[#f8fffe]",
                      notification.read
                        ? "border-[#e0e0e0] bg-white"
                        : "border-[#b8ece8] bg-[#f0fffe]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-[#1a1a1a]">{notification.title}</p>
                        <p className="text-sm text-[#666]">{notification.message}</p>
                        <p className="mt-1 text-xs text-[#999]">
                          {notification.type.toUpperCase()} • {notification.time}
                        </p>
                      </div>
                      {!notification.read ? (
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#008080]" />
                      ) : null}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <ActionButton
                        icon={<MdMarkEmailRead size={16} />}
                        label="Mark read"
                        onClick={() => markRead(notification.id)}
                      />
                      <ActionButton
                        icon={<MdVisibility size={16} />}
                        label="View details"
                        onClick={() => showToast("Opening details...")}
                      />
                      <ActionButton
                        icon={<MdDoNotDisturbOn size={16} />}
                        label="Snooze"
                        onClick={() => snoozeNotification(notification.id)}
                      />
                      <ActionButton
                        icon={<MdDelete size={16} />}
                        label="Delete"
                        danger
                        onClick={() => deleteNotification(notification.id)}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <aside className="rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm">
              <h2 className="text-lg font-bold text-[#1a1a1a]">Notification Preferences</h2>
              <div className="mt-3 space-y-2">
                <Toggle label="Orders" checked={prefOrders} onChange={setPrefOrders} />
                <Toggle label="Reviews" checked={prefReviews} onChange={setPrefReviews} />
                <Toggle label="Stock Alerts" checked={prefStock} onChange={setPrefStock} />
                <Toggle label="Payments" checked={prefPayments} onChange={setPrefPayments} />
                <Toggle label="System Updates" checked={prefSystem} onChange={setPrefSystem} />
              </div>

              <h3 className="mt-5 text-sm font-bold uppercase tracking-wide text-[#666]">
                Quiet Hours
              </h3>
              <Toggle
                label="Enable Quiet Hours"
                checked={quietEnabled}
                onChange={setQuietEnabled}
              />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <label className="text-xs font-semibold text-[#333]">
                  Start
                  <div className="mt-1 flex items-center rounded-lg border border-[#e0e0e0] px-2">
                    <MdOutlineSchedule size={14} className="text-[#666]" />
                    <input
                      type="time"
                      value={quietStart}
                      onChange={(e) => setQuietStart(e.target.value)}
                      className="w-full bg-transparent px-1 py-2 text-xs outline-none"
                    />
                  </div>
                </label>
                <label className="text-xs font-semibold text-[#333]">
                  End
                  <div className="mt-1 flex items-center rounded-lg border border-[#e0e0e0] px-2">
                    <MdOutlineSchedule size={14} className="text-[#666]" />
                    <input
                      type="time"
                      value={quietEnd}
                      onChange={(e) => setQuietEnd(e.target.value)}
                      className="w-full bg-transparent px-1 py-2 text-xs outline-none"
                    />
                  </div>
                </label>
              </div>

              <h3 className="mt-5 text-sm font-bold uppercase tracking-wide text-[#666]">
                Delivery Frequency
              </h3>
              <label className="mt-2 block text-xs font-semibold text-[#333]">
                Email
                <select
                  value={emailFrequency}
                  onChange={(e) => setEmailFrequency(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm"
                >
                  {["Instant", "Hourly", "Daily", "Weekly"].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="mt-2 block text-xs font-semibold text-[#333]">
                SMS
                <select
                  value={smsFrequency}
                  onChange={(e) => setSmsFrequency(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm"
                >
                  {["Instant", "Daily", "Weekly", "Never"].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => showToast("Preferences saved")}
                className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
              >
                <MdNotificationsActive size={16} />
                Save Preferences
              </button>
            </aside>
          </div>
        </div>
      </div>

      {toast ? (
        <div className="fixed right-4 top-4 z-[70] rounded-lg bg-[#27ae60] px-4 py-3 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </main>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  danger
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition",
        danger
          ? "border-[#f6d2ce] text-[#e74c3c] hover:bg-[#fdecea]"
          : "border-[#e0e0e0] text-[#333] hover:bg-[#f8fffe]"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function Toggle({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="inline-flex w-full items-center justify-between rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm">
      <span>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition",
          checked ? "bg-[#008080]" : "bg-[#d1d5db]"
        )}
        aria-label={label}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </label>
  );
}
