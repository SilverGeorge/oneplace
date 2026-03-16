type Plan = {
  name: string;
  price: string;
  features: string[];
  buttonLabel: string;
  popular?: boolean;
};

const plans: Plan[] = [
  {
    name: "Free",
    price: "Free",
    features: [
      "1 Store Profile",
      "Basic Analytics",
      "Limited Listings",
      "Community Support",
      "Standard Visibility"
    ],
    buttonLabel: "Get Started"
  },
  {
    name: "Basic",
    price: "$9.99/month",
    features: [
      "Up to 5 Store Profiles",
      "Priority Listing",
      "Email Support",
      "Advanced Analytics",
      "Custom Store Themes",
      "Basic Integrations"
    ],
    buttonLabel: "Get Started"
  },
  {
    name: "Pro",
    price: "$19.99/month",
    features: [
      "Unlimited Store Profiles",
      "Featured Homepage Placement",
      "Priority Email + Chat Support",
      "Team Access",
      "Automation Tools",
      "Detailed Insights",
      "Advanced Integrations"
    ],
    buttonLabel: "Upgrade",
    popular: true
  },
  {
    name: "Premium",
    price: "$49.99/month",
    features: [
      "Everything in Pro",
      "Dedicated Success Manager",
      "Premium Branding",
      "Custom Reports",
      "Early Access Features",
      "SLA Support"
    ],
    buttonLabel: "Get Started"
  }
];

export default function PricingTiers() {
  return (
    <section id="pricing" className="bg-[#111827] py-12 sm:py-14 lg:py-16">
      <div className="container-main">
        <div className="text-center">
          <p className="inline-flex rounded-full bg-[#1f2937] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#27ae60]">
            Subscription Plans
          </p>
          <h2 className="mt-3 text-[28px] font-bold text-white sm:text-[34px]">Choose Your Plan</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
            Flexible pricing for every stage of your business, from launch to scale.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative w-full rounded-2xl border bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                plan.popular ? "border-[#ffc300] ring-2 ring-[#ffc300]/35" : "border-[#e7ecec]"
              }`}
            >
              {plan.popular ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#ffc300] px-3 py-1 text-[11px] font-bold text-slate-900 shadow">
                  MOST POPULAR
                </span>
              ) : null}

              <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
              <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
                {plan.price}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">Billed monthly</p>

              <ul className="mt-5 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-[14px] text-slate-700">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#e8f8f3] text-[11px] font-bold text-[#008080]">
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`mt-7 w-full rounded-lg px-4 py-3 text-sm font-semibold transition duration-300 hover:scale-[1.01] ${
                  plan.name === "Free"
                    ? "bg-slate-100 text-slate-800 hover:bg-slate-200"
                    : "bg-[#008080] text-white hover:bg-[#0a6d6d]"
                }`}
              >
                {plan.buttonLabel}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
