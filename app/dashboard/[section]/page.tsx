import Link from "next/link";

const sectionNameMap: Record<string, string> = {
  store: "Store",
  products: "Products",
  orders: "Orders",
  customers: "Customers",
  webstore: "Webstore",
  notifications: "Notifications",
  invoicing: "Invoicing",
  template: "Template",
  templates: "Templates",
  subscription: "Subscription",
  help: "Help",
  settings: "Settings"
};

export default async function DashboardSectionPage({
  params
}: {
  params: Promise<{ section: string }>;
}) {
  const resolved = await params;
  const title = sectionNameMap[resolved.section] ?? "Section";

  return (
    <main className="min-h-screen bg-[#f4f6f8] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl rounded-xl border border-[#e0e0e0] bg-white p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#008080]">Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold text-[#1a1a1a]">{title}</h1>
        <p className="mt-3 text-sm text-[#666]">
          This section is ready for the next implementation phase.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-lg bg-[#008080] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0a6d6d]"
        >
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
