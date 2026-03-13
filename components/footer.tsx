import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#111827] px-6 pb-10 pt-36 text-slate-200 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="inline-flex rounded-full bg-[#1f2937] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#27ae60]">
              Oneplace
            </p>
            <h3 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
              Marketplace tools that help vendors grow daily.
            </h3>
            <p className="mt-3 max-w-md text-sm text-slate-400">
              Manage listings, boost discoverability, and convert more customers with one
              platform.
            </p>
            <Link
              href="/signup"
              className="mt-5 inline-flex rounded-lg bg-[#008080] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#0a6d6d]"
            >
              Join Us
            </Link>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Company</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/" className="text-sm text-slate-400 transition duration-300 hover:text-[#27ae60]">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#categories" className="text-sm text-slate-400 transition duration-300 hover:text-[#27ae60]">
                  Storefront
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="text-sm text-slate-400 transition duration-300 hover:text-[#27ae60]">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-slate-400 transition duration-300 hover:text-[#27ae60]">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-sm text-slate-400 transition duration-300 hover:text-[#27ae60]">
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Support</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/#faq" className="text-sm text-slate-400 transition duration-300 hover:text-[#27ae60]">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-slate-400 transition duration-300 hover:text-[#27ae60]">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact#privacy" className="text-sm text-slate-400 transition duration-300 hover:text-[#27ae60]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/contact#terms" className="text-sm text-slate-400 transition duration-300 hover:text-[#27ae60]">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact#status" className="text-sm text-slate-400 transition duration-300 hover:text-[#27ae60]">
                  Status
                </Link>
              </li>
            </ul>
            <div className="mt-5 flex items-center gap-3">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-slate-400 transition duration-300 hover:text-[#27ae60]" aria-label="Facebook">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.7V5c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.3V11H8v3h2.2v8h3.3z" />
                </svg>
              </a>
              <a href="https://x.com" target="_blank" rel="noreferrer" className="text-slate-400 transition duration-300 hover:text-[#27ae60]" aria-label="Twitter">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M22 5.9c-.7.3-1.4.5-2.2.6.8-.5 1.3-1.2 1.6-2.1-.7.4-1.6.8-2.5 1A3.8 3.8 0 0016.1 4c-2.1 0-3.8 1.8-3.8 4 0 .3 0 .6.1.9-3.2-.2-6-1.8-7.9-4.2-.3.6-.5 1.2-.5 1.9 0 1.4.7 2.6 1.7 3.3-.6 0-1.2-.2-1.7-.5v.1c0 1.9 1.3 3.5 3.1 3.8-.3.1-.7.2-1 .2-.2 0-.5 0-.7-.1.5 1.6 2 2.8 3.7 2.8A7.7 7.7 0 012 19.2 10.8 10.8 0 007.8 21c7 0 10.8-6 10.8-11.3V9c.8-.6 1.4-1.3 1.9-2.1-.7.3-1.4.5-2.1.6.7-.5 1.3-1.1 1.6-1.9z" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-slate-400 transition duration-300 hover:text-[#27ae60]" aria-label="Instagram">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2.2A2.8 2.8 0 004.2 7v10A2.8 2.8 0 007 19.8h10a2.8 2.8 0 002.8-2.8V7A2.8 2.8 0 0017 4.2H7zm11.5 1.6a1.1 1.1 0 110 2.2 1.1 1.1 0 010-2.2zM12 7a5 5 0 110 10 5 5 0 010-10zm0 2.2a2.8 2.8 0 100 5.6 2.8 2.8 0 000-5.6z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-5">
          <p className="text-center text-xs text-slate-500">
            © 2024 Oneplace. Inspired by modern food-tech marketplace design patterns.
          </p>
        </div>
      </div>
    </footer>
  );
}
