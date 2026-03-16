"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";

type LoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    bio?: string | null;
    avatarUrl?: string | null;
  };
};

type FormValues = {
  email: string;
  password: string;
  rememberMe: boolean;
};

type FormErrors = {
  email?: string;
  password?: string;
};

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.password.trim()) {
    errors.password = "Password is required.";
  }

  return errors;
}

export default function StorefrontLoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [values, setValues] = useState<FormValues>({
    email: "",
    password: "",
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [shakeForm, setShakeForm] = useState(false);

  const errors = useMemo(() => validate(values), [values]);
  const isValid = Object.keys(errors).length === 0;

  function shouldShowError(field: keyof FormErrors): boolean {
    return Boolean((submitAttempted || touched[field]) && errors[field]);
  }

  function inputClass(hasError: boolean): string {
    return [
      "w-full rounded-lg border bg-white px-4 py-3 text-[16px] text-[#1a1a1a] transition duration-200",
      "hover:shadow-sm focus:scale-[1.01] focus:outline-none focus:shadow-sm",
      hasError ? "border-[#e74c3c]" : "border-[#e0e0e0] focus:border-[#008080]"
    ].join(" ");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitAttempted(true);
    setErrorBanner("");
    setSuccessMessage("");

    if (!isValid) {
      setErrorBanner("Invalid email or password");
      setShakeForm(true);
      window.setTimeout(() => setShakeForm(false), 350);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiRequest<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: values.email,
          password: values.password
        })
      });

      setAuth({
        token: response.data.token,
        user: response.data.user
      });
      setSuccessMessage("Login successful. Redirecting...");
      window.setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } catch {
      setErrorBanner("Invalid email or password");
      setShakeForm(true);
      window.setTimeout(() => setShakeForm(false), 350);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f9f9f9] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1200px]">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-lg font-bold text-[#008080] transition hover:opacity-90"
          >
            Storefront
          </button>
          <p className="text-sm text-slate-600">Home / Login</p>
        </header>

        <section className="grid gap-6 md:grid-cols-5 lg:grid-cols-2">
          <div
            className={`animate-form-fade rounded-xl bg-white p-5 shadow-sm sm:p-8 ${shakeForm ? "animate-shake" : ""}`}
          >
            <h2 className="text-[32px] font-bold text-[#008080]">Welcome Back to Storefront</h2>
            <p className="mt-2 text-[18px] text-gray-500">
              Sign in to manage your store and reach more customers
            </p>

            {errorBanner ? (
              <div className="mt-4 rounded-lg border border-[#e74c3c]/30 bg-[#fdecea] px-4 py-3 text-sm font-medium text-[#e74c3c]">
                {errorBanner}
              </div>
            ) : null}

            <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-[14px] font-semibold text-[#1a1a1a]"
                >
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  value={values.email}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, email: event.target.value }))
                  }
                  onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                  aria-label="Email Address"
                  placeholder="your@email.com"
                  className={inputClass(shouldShowError("email"))}
                  disabled={isSubmitting}
                />
                {shouldShowError("email") ? (
                  <p className="mt-1 text-[12px] text-[#e74c3c]">{errors.email}</p>
                ) : (
                  <p className="mt-1 text-[12px] text-[#999999]">
                    Use the email associated with your storefront.
                  </p>
                )}
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-[14px] font-semibold text-[#1a1a1a]"
                  >
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => router.push("/forgot-password")}
                    className="group relative text-[14px] text-[#008080]"
                  >
                    Forgot password?
                    <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-[#008080] transition-transform duration-200 group-hover:scale-x-100" />
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={values.password}
                    onChange={(event) =>
                      setValues((prev) => ({ ...prev, password: event.target.value }))
                    }
                    onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                    aria-label="Password"
                    className={inputClass(shouldShowError("password"))}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#008080]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {shouldShowError("password") ? (
                  <p className="mt-1 text-[12px] text-[#e74c3c]">{errors.password}</p>
                ) : null}
              </div>

              <label className="flex items-center gap-2 text-sm text-[#1a1a1a]">
                <input
                  type="checkbox"
                  checked={values.rememberMe}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, rememberMe: event.target.checked }))
                  }
                  className="h-4 w-4 rounded border border-[#e0e0e0] accent-[#008080]"
                  disabled={isSubmitting}
                />
                Remember me
              </label>

              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#008080] px-8 py-[14px] text-[16px] font-semibold text-white transition duration-200 hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="group relative block text-left text-[14px] text-[#008080]"
              >
                Don&apos;t have an account? Create one
                <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-[#008080] transition-transform duration-200 group-hover:scale-x-100" />
              </button>

              <div className="pt-2">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#e0e0e0]" />
                  <span className="text-xs text-[#999999]">Or continue with</span>
                  <div className="h-px flex-1 bg-[#e0e0e0]" />
                </div>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full items-center justify-center gap-3 rounded-lg border border-[#e0e0e0] bg-white px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-slate-50"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path
                      fill="#EA4335"
                      d="M12 10.2v3.9h5.5c-.2 1.2-1.4 3.6-5.5 3.6-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3 14.7 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.2-.2-1.8H12z"
                    />
                  </svg>
                  Continue with Google
                </button>
              </div>

              {successMessage ? (
                <p className="animate-success-fade text-sm font-semibold text-[#27ae60]">
                  {successMessage}
                </p>
              ) : null}
            </form>
          </div>

          <aside className="hidden rounded-xl bg-white p-6 shadow-sm md:col-span-2 md:block lg:col-span-1 lg:p-8">
            <div className="mb-6 rounded-xl bg-gradient-to-br from-[#e8f8f8] to-[#f8f8f8] p-6 text-center">
              <div className="mx-auto flex h-32 w-full max-w-xs items-center justify-center rounded-lg border border-dashed border-[#d3eaea] bg-white text-sm text-slate-500">
                Vendor Success Illustration
              </div>
            </div>
            <h3 className="text-[24px] font-bold text-[#1a1a1a]">Grow Your Business</h3>
            <ul className="mt-4 space-y-3 text-[16px] text-slate-700">
              <li className="flex items-center gap-2">
                <span className="text-[#008080]">●</span>
                Access your dashboard
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#008080]">●</span>
                Manage orders and inventory
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#008080]">●</span>
                View sales analytics
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#008080]">●</span>
                Connect with customers
              </li>
            </ul>
          </aside>
        </section>
      </div>
    </main>
  );
}
