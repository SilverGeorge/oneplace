"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MdMenu } from "react-icons/md";
import { apiRequest } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { SidebarMenu, withPreviewParam } from "@/components/dashboard/SidebarMenu";
import { usePreviewMode } from "@/hooks/use-preview-mode";

type SettingsCategory =
  | "account"
  | "store"
  | "security"
  | "notifications"
  | "payment"
  | "billing"
  | "privacy"
  | "keys"
  | "integrations"
  | "about";

type UserSettings = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  storeName: string;
  category: string;
  description: string;
  website: string;
  timezone: string;
  currency: string;
  notifications: {
    email: boolean;
    order: boolean;
    review: boolean;
    promo: boolean;
    weekly: boolean;
    daily: boolean;
  };
};

const categories: Array<{ id: SettingsCategory; label: string }> = [
  { id: "account", label: "Account" },
  { id: "store", label: "Store Information" },
  { id: "security", label: "Security" },
  { id: "notifications", label: "Notifications" },
  { id: "payment", label: "Payment Methods" },
  { id: "billing", label: "Billing & Subscription" },
  { id: "privacy", label: "Privacy & Policies" },
  { id: "keys", label: "API Keys" },
  { id: "integrations", label: "Integrations" },
  { id: "about", label: "About" }
];

const inputClass =
  "w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-sm text-[#1a1a1a] transition focus:border-[#008080] focus:outline-none";

export default function SettingsPage() {
  const pathname = usePathname() ?? "/dashboard/settings";
  const isPreviewMode = usePreviewMode();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [category, setCategory] = useState<SettingsCategory>("account");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [passwordValues, setPasswordValues] = useState({ current: "", next: "", confirm: "" });
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    storeName: "",
    category: "",
    description: "",
    website: "",
    timezone: "",
    currency: "",
    notifications: {
      email: true,
      order: true,
      review: true,
      promo: false,
      weekly: true,
      daily: false
    }
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest<{ settings: UserSettings; twoFaEnabled: boolean }>(
          "/api/user/settings"
        );
        setSettings(res.data.settings);
        setTwoFaEnabled(res.data.twoFaEnabled);
      } catch (error) {
        setToast({
          type: "error",
          message: error instanceof Error ? error.message : "Failed to load settings"
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

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await apiRequest<{ message: string }>("/api/user/settings", {
        method: "PUT",
        body: JSON.stringify(settings)
      });
      setToast({ type: "success", message: "Settings saved successfully" });
    } catch {
      setToast({ type: "error", message: "Could not save settings" });
    } finally {
      setIsSaving(false);
    }
  }

  async function changePassword() {
    if (
      !passwordValues.current ||
      !passwordValues.next ||
      passwordValues.next !== passwordValues.confirm
    ) {
      setToast({ type: "error", message: "Check password fields" });
      return;
    }
    try {
      await apiRequest<{ message: string }>("/api/user/password", {
        method: "PUT",
        body: JSON.stringify(passwordValues)
      });
      setPasswordValues({ current: "", next: "", confirm: "" });
      setToast({ type: "success", message: "Password changed successfully" });
    } catch {
      setToast({ type: "error", message: "Could not change password" });
    }
  }

  async function deleteAccount() {
    try {
      await apiRequest<{ message: string }>("/api/user/account", { method: "DELETE" });
      setToast({ type: "success", message: "Account deletion requested (demo)." });
    } catch {
      setToast({ type: "error", message: "Could not delete account" });
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
            &gt; Settings
          </nav>
          <h1 className="mt-2 text-[40px] font-bold text-[#008080]">Settings</h1>

          <div className="mt-4 grid gap-4 lg:grid-cols-[220px_1fr]">
            <aside className="rounded-xl border border-[#e0e0e0] bg-[#f9f9f9] p-3 lg:sticky lg:top-4 lg:h-fit">
              <ul className="space-y-1">
                {categories.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setCategory(item.id)}
                      className={cn(
                        "w-full rounded-l-xl border-l-4 border-transparent px-3 py-2 text-left text-sm transition",
                        category === item.id
                          ? "border-[#008080] bg-[#f8fffe] text-[#008080]"
                          : "text-[#333] hover:bg-[#efefef]"
                      )}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </aside>

            <section className="rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              {isLoading ? <div className="h-64 animate-pulse rounded bg-[#f9f9f9]" /> : null}
              {!isLoading && category === "account" ? (
                <div className="space-y-8">
                  <h2 className="text-[28px] font-bold text-[#1a1a1a]">Account Settings</h2>
                  <form onSubmit={saveSettings} className="space-y-8">
                    <section className="border-t border-[#f0f0f0] pt-6">
                      <h3 className="text-[18px] font-bold">Profile Information</h3>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <Field label="First Name">
                          <input
                            value={settings.firstName}
                            onChange={(e) =>
                              setSettings({ ...settings, firstName: e.target.value })
                            }
                            className={inputClass}
                          />
                        </Field>
                        <Field label="Last Name">
                          <input
                            value={settings.lastName}
                            onChange={(e) => setSettings({ ...settings, lastName: e.target.value })}
                            className={inputClass}
                          />
                        </Field>
                        <Field label="Email">
                          <input
                            value={settings.email}
                            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                            className={inputClass}
                          />
                        </Field>
                        <Field label="Phone">
                          <input
                            value={settings.phone}
                            onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                            className={inputClass}
                          />
                        </Field>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <Image
                          src="https://i.pravatar.cc/80?img=12"
                          alt="Profile avatar"
                          width={80}
                          height={80}
                          className="rounded-full object-cover"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="rounded-lg bg-[#008080] px-3 py-2 text-sm font-semibold text-white"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-[#e0e0e0] bg-[#f0f0f0] px-3 py-2 text-sm font-semibold text-[#333]"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white hover:scale-[1.02] disabled:opacity-60"
                        >
                          {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </section>
                  </form>

                  <section className="border-t border-[#f0f0f0] pt-6">
                    <h3 className="text-[18px] font-bold">Password</h3>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <Field label="Current Password">
                        <input
                          type="password"
                          value={passwordValues.current}
                          onChange={(e) =>
                            setPasswordValues({ ...passwordValues, current: e.target.value })
                          }
                          className={inputClass}
                        />
                      </Field>
                      <Field label="New Password">
                        <input
                          type="password"
                          value={passwordValues.next}
                          onChange={(e) =>
                            setPasswordValues({ ...passwordValues, next: e.target.value })
                          }
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Confirm Password">
                        <input
                          type="password"
                          value={passwordValues.confirm}
                          onChange={(e) =>
                            setPasswordValues({ ...passwordValues, confirm: e.target.value })
                          }
                          className={inputClass}
                        />
                      </Field>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => void changePassword()}
                        className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white hover:scale-[1.02]"
                      >
                        Change Password
                      </button>
                    </div>
                  </section>

                  <section className="border-t border-[#f0f0f0] pt-6">
                    <h3 className="text-[18px] font-bold">Two-Factor Authentication</h3>
                    <div className="mt-3 flex items-center justify-between rounded-lg bg-[#f9f9f9] p-3">
                      <p className="text-sm text-[#666]">
                        {twoFaEnabled
                          ? "Two-Factor Authentication is enabled"
                          : "Add extra security to your account"}
                      </p>
                      <button
                        type="button"
                        onClick={() => setTwoFaEnabled((prev) => !prev)}
                        className={cn(
                          "rounded-full px-4 py-2 text-xs font-semibold",
                          twoFaEnabled ? "bg-[#27ae60] text-white" : "bg-[#008080] text-white"
                        )}
                      >
                        {twoFaEnabled ? "Manage 2FA" : "Enable 2FA"}
                      </button>
                    </div>
                    {twoFaEnabled ? (
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setTwoFaEnabled(false)}
                          className="rounded-lg bg-[#e74c3c] px-4 py-2 text-sm font-semibold text-white"
                        >
                          Disable 2FA
                        </button>
                      </div>
                    ) : null}
                  </section>

                  <section className="border-t border-[#f0f0f0] pt-6">
                    <h3 className="text-[18px] font-bold">Session Management</h3>
                    <ul className="mt-3 space-y-2">
                      {[
                        ["Chrome on Windows", "New York, USA", "2 hours ago"],
                        ["Safari on iPhone", "Lagos, Nigeria", "5 mins ago"]
                      ].map(([device, location, active]) => (
                        <li
                          key={device}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#e0e0e0] p-3"
                        >
                          <div>
                            <p className="text-sm font-semibold text-[#1a1a1a]">{device}</p>
                            <p className="text-xs text-[#999]">
                              {location} • {active}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="rounded-lg bg-[#e74c3c] px-3 py-1.5 text-xs font-semibold text-white"
                          >
                            Sign Out
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        className="rounded-lg bg-[#e74c3c] px-4 py-2 text-sm font-semibold text-white"
                      >
                        Sign out all other sessions
                      </button>
                    </div>
                  </section>
                </div>
              ) : null}

              {!isLoading && category === "store" ? (
                <form onSubmit={saveSettings} className="space-y-4">
                  <h2 className="text-[28px] font-bold text-[#1a1a1a]">Store Information</h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Store Name">
                      <input
                        value={settings.storeName}
                        onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Category">
                      <input
                        value={settings.category}
                        onChange={(e) => setSettings({ ...settings, category: e.target.value })}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Description" className="md:col-span-2">
                      <textarea
                        value={settings.description}
                        onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                        className={inputClass}
                        rows={3}
                      />
                    </Field>
                    <Field label="Website">
                      <input
                        value={settings.website}
                        onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Email">
                      <input
                        value={settings.email}
                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Phone">
                      <input
                        value={settings.phone}
                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Timezone">
                      <input
                        value={settings.timezone}
                        onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Currency">
                      <input
                        value={settings.currency}
                        onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
                    >
                      Save Store Information
                    </button>
                  </div>
                </form>
              ) : null}

              {!isLoading && category === "security" ? (
                <div className="space-y-6">
                  <h2 className="text-[28px] font-bold text-[#1a1a1a]">Security</h2>
                  <section>
                    <h3 className="text-[18px] font-bold">Connected Apps</h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      {["Stripe", "PayPal"].map((app) => (
                        <li
                          key={app}
                          className="flex justify-between rounded-lg border border-[#e0e0e0] p-3"
                        >
                          <span>{app}</span>
                          <button
                            type="button"
                            className="rounded bg-[#e74c3c] px-3 py-1 text-xs font-semibold text-white"
                          >
                            Disconnect
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h3 className="text-[18px] font-bold">Login Activity</h3>
                    <p className="mt-2 text-sm text-[#666]">
                      Recent login entries are displayed here.
                    </p>
                  </section>
                  <section>
                    <h3 className="text-[18px] font-bold">Trusted Devices</h3>
                    <p className="mt-2 text-sm text-[#666]">Manage trusted devices.</p>
                  </section>
                </div>
              ) : null}

              {!isLoading && category === "notifications" ? (
                <div>
                  <h2 className="text-[28px] font-bold text-[#1a1a1a]">Notifications</h2>
                  <div className="mt-3 space-y-2">
                    {[
                      ["Email Notifications", "email"],
                      ["Order Notifications", "order"],
                      ["Review Notifications", "review"],
                      ["Promotional Emails", "promo"],
                      ["Weekly Report", "weekly"],
                      ["Daily Summary", "daily"]
                    ].map(([label, key]) => (
                      <label
                        key={key}
                        className="flex items-center justify-between rounded-lg border border-[#e0e0e0] p-3 text-sm"
                      >
                        {label}
                        <input
                          type="checkbox"
                          checked={
                            settings.notifications[key as keyof UserSettings["notifications"]]
                          }
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, [key]: e.target.checked }
                            })
                          }
                          className="h-5 w-5 accent-[#008080]"
                        />
                      </label>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setToast({ type: "success", message: "Preferences saved" })}
                      className="rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              ) : null}

              {!isLoading && category === "payment" ? (
                <SimpleSection title="Payment Methods" />
              ) : null}
              {!isLoading && category === "billing" ? (
                <SimpleSection title="Billing & Subscription" />
              ) : null}
              {!isLoading && category === "privacy" ? (
                <div className="space-y-3">
                  <h2 className="text-[28px] font-bold text-[#1a1a1a]">Privacy & Policies</h2>
                  {["Terms of Service", "Privacy Policy", "Cookie Policy"].map((item) => (
                    <label key={item} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="h-4 w-4 accent-[#008080]" /> {item}
                    </label>
                  ))}
                  <div className="rounded-lg border border-[#e74c3c] bg-[#fdecea] p-3">
                    <p className="text-sm text-[#c0392b]">
                      This action is permanent and cannot be undone.
                    </p>
                    <button
                      type="button"
                      onClick={() => void deleteAccount()}
                      className="mt-2 rounded-lg bg-[#e74c3c] px-4 py-2 text-sm font-semibold text-white"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              ) : null}
              {!isLoading && category === "keys" ? <SimpleSection title="API Keys" /> : null}
              {!isLoading && category === "integrations" ? (
                <SimpleSection title="Integrations" />
              ) : null}
              {!isLoading && category === "about" ? <SimpleSection title="About" /> : null}
            </section>
          </div>
        </div>
      </div>

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
    <label className={cn("block text-sm text-[#1a1a1a]", className)}>
      <span className="mb-1 block text-xs font-bold text-[#333]">{label}</span>
      {children}
    </label>
  );
}

function SimpleSection({ title }: { title: string }) {
  return (
    <div>
      <h2 className="text-[28px] font-bold text-[#1a1a1a]">{title}</h2>
      <p className="mt-2 text-sm text-[#666]">This section is ready for your detailed workflow.</p>
    </div>
  );
}
