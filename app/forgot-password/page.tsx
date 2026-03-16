"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { MdCheckCircle, MdEmail, MdLockOutline } from "react-icons/md";
import { apiRequest } from "@/lib/api-client";

type ResetResponse = {
  message: string;
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await apiRequest<ResetResponse>("/api/auth/password-reset", {
        method: "POST",
        body: JSON.stringify({ email })
      });
      setSuccessMessage(response.data.message || "Reset link sent successfully.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to process request");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#effcfa] via-white to-[#f5fbfb] px-4 py-10">
      <section className="w-full max-w-[500px] rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f0fffe] text-[#008080]">
          {successMessage ? <MdCheckCircle size={48} /> : <MdLockOutline size={48} />}
        </div>

        <h1 className="mt-4 text-center text-3xl font-bold text-[#1a1a1a]">Forgot Password?</h1>
        <p className="mt-2 text-center text-sm text-[#666]">
          Enter your email address and we&apos;ll send a reset link.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-[#1a1a1a]">
            Email Address
            <div className="mt-1 flex items-center rounded-lg border border-[#e0e0e0] px-3 focus-within:border-[#008080]">
              <MdEmail size={20} className="text-[#999]" />
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-3 text-[16px] outline-none"
              />
            </div>
          </label>

          {errorMessage ? (
            <p className="text-sm font-medium text-[#e74c3c]">{errorMessage}</p>
          ) : null}
          {successMessage ? (
            <p className="flex items-center gap-2 text-sm font-medium text-[#27ae60]">
              <MdCheckCircle size={18} />
              {successMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-[#008080] px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] hover:bg-[#0a6d6d] disabled:opacity-60"
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#666]">
          Remembered your password?{" "}
          <Link href="/login" className="font-semibold text-[#008080] hover:underline">
            Back to Login
          </Link>
        </p>
      </section>
    </main>
  );
}
