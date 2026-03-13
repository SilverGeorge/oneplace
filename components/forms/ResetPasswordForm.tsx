"use client";

import { type FormEvent, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { Button, Input } from "@/components/ui";

type ResetResponse = {
  message: string;
};

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await apiRequest<ResetResponse>("/api/auth/password-reset", {
        method: "POST",
        body: JSON.stringify({ email })
      });
      setFeedback(response.data.message);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to process request");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      {feedback ? <p className="text-sm font-medium text-emerald-700">{feedback}</p> : null}
      {errorMessage ? <p className="text-sm font-medium text-red-600">{errorMessage}</p> : null}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Reset Link"}
      </Button>
    </form>
  );
}
