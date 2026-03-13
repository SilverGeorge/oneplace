export default function CtaCard() {
  return (
    <section className="container-main relative z-20 -mb-24 py-8 sm:-mb-28 sm:py-10">
      <div className="overflow-hidden rounded-[28px] bg-gradient-to-r from-[#008080] via-[#0c9a9a] to-[#008080] p-8 text-white shadow-2xl sm:p-10">
        <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90">
          Grow Faster
        </p>
        <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Ready to launch faster?</h2>
        <p className="mt-3 max-w-2xl text-white/90">
          Join teams using BrandFlow to streamline operations, reach more customers, and scale with
          confidence.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button className="rounded-xl bg-[#ffc300] px-5 py-3 font-semibold text-slate-900 transition duration-300 hover:scale-[1.02] hover:bg-[#e6af00]">
            Create Your Account
          </button>
          <button className="rounded-xl border border-white/40 bg-white/10 px-5 py-3 font-semibold text-white transition duration-300 hover:bg-white/20">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
}
