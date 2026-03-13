import { Navbar } from "@/components/navbar";

const sidebarItems = ["Overview", "Customers", "Billing", "Integrations", "Settings"];

const stats = [
  { label: "MRR", value: "$24.3k", trend: "+8.2%" },
  { label: "New Signups", value: "312", trend: "+14%" },
  { label: "Churn Rate", value: "2.4%", trend: "-0.6%" },
  { label: "Support Tickets", value: "18", trend: "-12%" }
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">Track your key SaaS metrics at a glance.</p>

        <div className="mt-6 grid gap-4 lg:grid-cols-[240px_1fr]">
          <aside className="card p-4">
            <ul className="space-y-1">
              {sidebarItems.map((item, index) => (
                <li key={item}>
                  <button
                    type="button"
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                      index === 0 ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <article key={stat.label} className="card p-4">
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="mt-1 text-sm font-medium text-emerald-600">{stat.trend}</p>
                </article>
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <article className="card p-5 xl:col-span-2">
                <h2 className="text-lg font-semibold text-slate-900">Revenue by week</h2>
                <div className="mt-4 flex h-56 items-end gap-3 rounded-xl bg-slate-100 p-4">
                  {[35, 54, 62, 48, 76, 82, 90].map((height, idx) => (
                    <div key={idx} className="flex-1 rounded-t-lg bg-brand-500" style={{ height: `${height}%` }} />
                  ))}
                </div>
              </article>
              <article className="card p-5">
                <h2 className="text-lg font-semibold text-slate-900">Tasks</h2>
                <ul className="mt-4 space-y-3 text-sm text-slate-700">
                  <li className="rounded-lg bg-slate-100 px-3 py-2">Review onboarding funnel</li>
                  <li className="rounded-lg bg-slate-100 px-3 py-2">Respond to enterprise lead</li>
                  <li className="rounded-lg bg-slate-100 px-3 py-2">Update pricing page copy</li>
                </ul>
              </article>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
