"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

const faqs = [
  {
    question: "How do I create an account?",
    answer: "Click the Create Account button, fill in your details, and verify your email to begin."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept major credit/debit cards and selected local payment options at checkout."
  },
  {
    question: "How long does delivery take?",
    answer: "Delivery times vary by seller and location, but most orders arrive within 3-7 business days."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your plan from account settings, and it remains active through the billing period."
  },
  {
    question: "Is my data secure?",
    answer: "Yes. We use encryption in transit and secure infrastructure to protect your data."
  },
  {
    question: "How do I contact support?",
    answer: "Use the Contact page or in-app support chat to reach our team."
  },
  {
    question: "What's the refund policy?",
    answer: "Refund eligibility depends on plan type and usage. See our policy page for full details."
  },
  {
    question: "Can I change my plan?",
    answer: "You can upgrade or downgrade at any time from billing settings."
  },
  {
    question: "Do you offer customer support?",
    answer: "Yes, all users get support. Priority response is available on higher plans."
  },
  {
    question: "How do I reset my password?",
    answer: "Go to Login, click Reset Password, and follow the email instructions."
  }
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggleItem(index: number) {
    setOpenIndex((prev) => (prev === index ? null : index));
  }

  return (
    <section id="faq" className="container-main py-12 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-5xl rounded-3xl border border-[#e8eeee] bg-gradient-to-b from-[#f7fbfb] to-white p-5 sm:p-8 lg:p-10">
        <div className="text-center">
          <p className="inline-flex rounded-full bg-[#e8f8f3] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#008080]">
            Support
          </p>
          <h2 className="mt-3 text-[28px] font-bold text-slate-900 sm:text-[34px]">Got Questions?</h2>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Everything you need to know before launching and growing your storefront.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-4xl">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={faq.question}
              className="mb-3 overflow-hidden rounded-2xl border border-[#e6eaea] bg-white shadow-sm transition-all duration-300 hover:-translate-y-[2px] hover:shadow-md"
            >
              <button
                type="button"
                onClick={() => toggleItem(index)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-[16px] font-semibold text-slate-800">{faq.question}</span>
                <span
                  className={cn(
                    "inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#dbe7e7] bg-[#f7fbfb] text-[#008080] transition-all duration-300 ease-in-out",
                    isOpen ? "rotate-180 border-[#008080]/40 bg-[#e8f8f3]" : "rotate-0"
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
                  <p className="px-5 pb-5 text-[14px] leading-relaxed text-slate-600">{faq.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
}
