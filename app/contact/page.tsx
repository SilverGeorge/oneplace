"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

type ContactFormValues = {
  fullName: string;
  email: string;
  subject: string;
  message: string;
};

type ContactErrors = Partial<Record<keyof ContactFormValues, string>>;

const faqItems = [
  {
    question: "How quickly will your team respond?",
    answer: "We usually reply within 2-6 hours on business days, and within 24 hours on weekends."
  },
  {
    question: "Do you offer onboarding for new vendors?",
    answer:
      "Yes. Our onboarding specialists can guide you through setup, catalog upload, and first campaigns."
  },
  {
    question: "Can I request a custom enterprise demo?",
    answer: "Absolutely. Submit your details and we will schedule a tailored walkthrough."
  },
  {
    question: "Where can I manage billing issues?",
    answer:
      "Billing settings are available in your dashboard. You can also contact us for invoice support."
  },
  {
    question: "Do you provide 24/7 support?",
    answer:
      "Priority channels are available 24/7 for premium plans, while standard support follows local hours."
  },
  {
    question: "How do I report a bug?",
    answer:
      "Use the contact form with a clear subject and screenshots; our engineering team will investigate."
  },
  {
    question: "Can I integrate third-party tools?",
    answer: "Yes. We support major integrations and provide API access for advanced workflows."
  },
  {
    question: "Is there a dedicated account manager?",
    answer: "Premium customers get a dedicated account manager for strategy and growth support."
  }
];

function validate(values: ContactFormValues): ContactErrors {
  const errors: ContactErrors = {};
  if (!values.fullName.trim()) errors.fullName = "Full name is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    errors.email = "Please enter a valid email.";
  if (!values.subject.trim()) errors.subject = "Subject is required.";
  if (values.message.trim().length < 10)
    errors.message = "Message should be at least 10 characters.";
  return errors;
}

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [values, setValues] = useState<ContactFormValues>({
    fullName: "",
    email: "",
    subject: "",
    message: ""
  });
  const [touched, setTouched] = useState<Partial<Record<keyof ContactFormValues, boolean>>>({});

  const errors = useMemo(() => validate(values), [values]);
  const canSubmit = Object.keys(errors).length === 0;

  function fieldClass(hasError: boolean): string {
    return cn(
      "w-full rounded-lg border bg-white px-4 py-3 text-base text-[#1a1a1a] transition duration-200",
      "hover:shadow-sm focus:scale-[1.01] focus:outline-none focus:shadow-sm",
      hasError ? "border-[#e74c3c]" : "border-[#e0e0e0] focus:border-[#008080]"
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (!canSubmit) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsSubmitting(false);
    setValues({ fullName: "", email: "", subject: "", message: "" });
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <Navbar />

      <section className="bg-[#e8f8f3] py-14 sm:py-16">
        <div className="container-main text-center">
          <h1 className="text-4xl font-bold text-[#008080] sm:text-5xl">Get in Touch</h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">
            We are here to help you launch, grow, and scale your storefront with confidence.
          </p>
        </div>
      </section>

      <section className="container-main py-10 sm:py-12 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="animate-form-fade rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold text-[#1a1a1a]">Send us a message</h2>
            <p className="mt-2 text-sm text-slate-500">Our team responds quickly and clearly.</p>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-1 block text-sm font-semibold text-slate-800"
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  value={values.fullName}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, fullName: event.target.value }))
                  }
                  onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
                  className={fieldClass(
                    Boolean((submitted || touched.fullName) && errors.fullName)
                  )}
                  placeholder="Your full name"
                />
                {(submitted || touched.fullName) && errors.fullName ? (
                  <p className="mt-1 text-xs text-[#e74c3c]">{errors.fullName}</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-semibold text-slate-800">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={values.email}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, email: event.target.value }))
                  }
                  onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                  className={fieldClass(Boolean((submitted || touched.email) && errors.email))}
                  placeholder="your@email.com"
                />
                {(submitted || touched.email) && errors.email ? (
                  <p className="mt-1 text-xs text-[#e74c3c]">{errors.email}</p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="mb-1 block text-sm font-semibold text-slate-800"
                >
                  Subject
                </label>
                <input
                  id="subject"
                  value={values.subject}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, subject: event.target.value }))
                  }
                  onBlur={() => setTouched((prev) => ({ ...prev, subject: true }))}
                  className={fieldClass(Boolean((submitted || touched.subject) && errors.subject))}
                  placeholder="How can we help?"
                />
                {(submitted || touched.subject) && errors.subject ? (
                  <p className="mt-1 text-xs text-[#e74c3c]">{errors.subject}</p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-1 block text-sm font-semibold text-slate-800"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={values.message}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, message: event.target.value }))
                  }
                  onBlur={() => setTouched((prev) => ({ ...prev, message: true }))}
                  className={fieldClass(Boolean((submitted || touched.message) && errors.message))}
                  placeholder="Tell us more about your request"
                />
                {(submitted || touched.message) && errors.message ? (
                  <p className="mt-1 text-xs text-[#e74c3c]">{errors.message}</p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#008080] px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-60 sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sending...
                  </>
                ) : (
                  "Submit"
                )}
              </button>

              {submitted && canSubmit && !isSubmitting ? (
                <p className="animate-success-fade text-sm font-semibold text-[#27ae60]">
                  Message sent successfully. We will get back to you soon.
                </p>
              ) : null}
            </form>
          </div>

          <aside className="rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-sm sm:p-8">
            <h3 className="text-2xl font-bold text-[#1a1a1a]">Contact Information</h3>
            <p className="mt-2 text-sm text-slate-500">Reach us through any of these channels.</p>
            <ul className="mt-5 space-y-3 text-sm text-slate-700">
              <li>
                <span className="font-semibold text-slate-900">Email:</span> support@oneplace.com
              </li>
              <li>
                <span className="font-semibold text-slate-900">Phone:</span> +1 (555) 302-1000
              </li>
              <li>
                <span className="font-semibold text-slate-900">Address:</span> 123 Market Street,
                San Francisco, CA
              </li>
              <li id="status">
                <span className="font-semibold text-slate-900">Status:</span> All systems
                operational
              </li>
            </ul>

            <div className="mt-8 space-y-2 rounded-xl bg-[#f7fbfb] p-4 text-sm text-slate-600">
              <p id="privacy" className="font-semibold text-slate-900">
                Privacy Policy
              </p>
              <p>We process your information securely and never share data without consent.</p>
              <p id="terms" className="pt-2 font-semibold text-slate-900">
                Terms of Service
              </p>
              <p>By using this platform, you agree to our fair-use and marketplace policies.</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="container-main py-10 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold text-slate-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-6 space-y-3">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={item.question}
                  className="rounded-2xl border border-[#e0e0e0] bg-white shadow-sm transition duration-300 hover:shadow-md"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq((prev) => (prev === index ? null : index))}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left"
                  >
                    <span className="text-base font-semibold text-slate-800">{item.question}</span>
                    <span
                      className={cn(
                        "inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f8f3] text-[#008080] transition-transform duration-300",
                        isOpen ? "rotate-180" : "rotate-0"
                      )}
                    >
                      ▼
                    </span>
                  </button>
                  <div
                    className={cn(
                      "grid transition-all duration-300 ease-in-out",
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-main pb-8">
        <div className="overflow-hidden rounded-[28px] bg-gradient-to-r from-[#008080] to-[#0c9a9a] p-8 text-white shadow-2xl sm:p-10">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to Get Started?</h2>
          <p className="mt-3 max-w-2xl text-white/90">
            Create your account and start growing your storefront with modern tools.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex rounded-xl bg-[#ffc300] px-5 py-3 font-semibold text-slate-900 transition duration-300 hover:scale-[1.02] hover:bg-[#e6af00]"
          >
            Create Account
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
