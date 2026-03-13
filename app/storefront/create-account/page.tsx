"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/cn";

const schema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  category: z.string().min(1, "Select category"),
  subCategory: z.string().min(1, "Select subcategory"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  countryCode: z.string().min(1, "Code required"),
  phoneNumber: z.string().regex(/^[0-9\s\-()]{7,20}$/, "Enter valid phone number"),
  email: z.string().email("Enter valid email"),
  logoPreview: z.string().min(1, "Logo is required"),
  bannerPreview: z.string().min(1, "Banner is required"),
  brandingDescription: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(500, "Description max is 500"),
  facebook: z.string().url("Enter a valid URL").or(z.literal("")),
  twitter: z.string().url("Enter a valid URL").or(z.literal("")),
  instagram: z.string().url("Enter a valid URL").or(z.literal("")),
  linkedin: z.string().url("Enter a valid URL").or(z.literal("")),
  plan: z.enum(["free", "pro", "premium"], {
    error: "Select a subscription plan"
  })
});

type FormValues = z.infer<typeof schema>;

const DRAFT_KEY = "storefront-business-creation-draft";
const SESSION_KEY = "storefront-business-creation-session";

const categories = ["Clothing", "Electronics", "Food", "Beauty", "Home", "Sports", "Books", "Health", "Tech", "Fashion", "Groceries"];
const subCategoryByCategory: Record<string, string[]> = {
  Clothing: ["Men", "Women", "Kids", "Accessories"],
  Electronics: ["Phones", "Laptops", "TV & Audio", "Gaming"],
  Food: ["Restaurant", "Bakery", "Groceries", "Drinks"],
  Beauty: ["Skincare", "Makeup", "Haircare", "Fragrance"],
  Home: ["Furniture", "Decor", "Kitchen", "Appliances"],
  Sports: ["Fitness", "Outdoor", "Footwear", "Supplements"],
  Books: ["Fiction", "Non-fiction", "Education", "Comics"],
  Health: ["Pharmacy", "Wellness", "Nutrition", "Medical Devices"],
  Tech: ["Software", "Hardware", "Accessories", "AI Tools"],
  Fashion: ["Luxury", "Streetwear", "Footwear", "Jewelry"],
  Groceries: ["Fresh Produce", "Pantry", "Frozen", "Beverages"]
};

const states = ["California", "Texas", "Lagos", "Abuja", "New York"];
const citiesByState: Record<string, string[]> = {
  California: ["Los Angeles", "San Diego", "San Francisco"],
  Texas: ["Houston", "Austin", "Dallas"],
  Lagos: ["Ikeja", "Lekki", "Yaba"],
  Abuja: ["Wuse", "Garki", "Maitama"],
  "New York": ["Brooklyn", "Queens", "Manhattan"]
};

const stepDefinitions = [
  {
    id: 0,
    title: "Basic Information",
    substeps: ["Business name", "Category", "SubCategory", "Location", "Phone number", "Email"]
  },
  {
    id: 1,
    title: "Store Branding",
    substeps: ["Logo", "Cover Banner", "Business Description", "Location", "Social Media Links"]
  },
  {
    id: 2,
    title: "Subscription plan",
    substeps: ["Free", "Pro", "Premium"]
  },
  {
    id: 3,
    title: "Review and Submit",
    substeps: ["Preview Store Details", "Submit"]
  }
] as const;

const plans = [
  {
    id: "free" as const,
    name: "Free Plan",
    price: "$0/month",
    features: ["Basic storefront", "10 products", "Standard support"],
    cta: "Select Free"
  },
  {
    id: "pro" as const,
    name: "Pro Plan",
    price: "$29/month",
    features: ["Advanced analytics", "100 products", "Priority support"],
    cta: "Select Pro"
  },
  {
    id: "premium" as const,
    name: "Premium Plan",
    price: "$99/month",
    features: ["Custom domain", "Unlimited products", "24/7 support"],
    cta: "Select Premium"
  }
];

const planPriceMap: Record<"free" | "pro" | "premium", string> = {
  free: "$0/month",
  pro: "$29/month",
  premium: "$99/month"
};

const defaultValues: FormValues = {
  businessName: "",
  category: "",
  subCategory: "",
  state: "",
  city: "",
  countryCode: "+1",
  phoneNumber: "",
  email: "",
  logoPreview: "",
  bannerPreview: "",
  brandingDescription: "",
  facebook: "",
  twitter: "",
  instagram: "",
  linkedin: "",
  plan: "free"
};

function loadDraft(): FormValues {
  if (typeof window === "undefined") return defaultValues;
  const sessionDraft = sessionStorage.getItem(SESSION_KEY);
  const localDraft = localStorage.getItem(DRAFT_KEY);
  const source = sessionDraft ?? localDraft;
  if (!source) return defaultValues;

  try {
    return { ...defaultValues, ...(JSON.parse(source) as Partial<FormValues>) };
  } catch {
    return defaultValues;
  }
}

export default function CreateStorefrontAccountPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formBannerError, setFormBannerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [shake, setShake] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<{ logo?: string; banner?: string }>({});
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    setValue,
    getValues,
    control,
    trigger,
    formState: { errors, isDirty }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: loadDraft()
  });

  const values = useWatch<FormValues>({ control }) ?? defaultValues;
  const selectedSubCategories = useMemo(
    () => subCategoryByCategory[values.category ?? ""] ?? [],
    [values.category]
  );
  const selectedCities = useMemo(() => citiesByState[values.state ?? ""] ?? [], [values.state]);
  const currentPlan = values.plan ?? "free";
  const canContinueFromCurrentStep = useMemo(() => {
    if (step === 0) {
      return Boolean(
        values.businessName &&
          values.category &&
          values.subCategory &&
          values.state &&
          values.city &&
          values.phoneNumber &&
          /^[0-9\s\-()]{7,20}$/.test(values.phoneNumber) &&
          values.email &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)
      );
    }
    if (step === 1) {
      const descriptionLength = (values.brandingDescription ?? "").length;
      return Boolean(
        values.logoPreview &&
          values.bannerPreview &&
          descriptionLength >= 20 &&
          descriptionLength <= 500 &&
          !uploadErrors.logo &&
          !uploadErrors.banner
      );
    }
    if (step === 2) {
      return Boolean(currentPlan);
    }
    return true;
  }, [step, values, uploadErrors, currentPlan]);

  useEffect(() => {
    const payload = { ...values, currentStep: step };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      void fetch("/api/storefront/create", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft: true, data: payload })
      });
    }, 500);

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [values, step]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty || isSubmitting) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty, isSubmitting]);

  async function validateStep(targetStep: number): Promise<boolean> {
    if (targetStep <= 0) return true;

    if (targetStep === 1) {
      return trigger(["businessName", "category", "subCategory", "state", "city", "phoneNumber", "email"]);
    }

    if (targetStep === 2) {
      const fieldsValid = await trigger([
        "logoPreview",
        "bannerPreview",
        "brandingDescription",
        "facebook",
        "twitter",
        "instagram",
        "linkedin"
      ]);
      const uploadValid = !uploadErrors.logo && !uploadErrors.banner;
      return fieldsValid && uploadValid;
    }

    if (targetStep >= 3) {
      return trigger(["plan"]);
    }

    return true;
  }

  async function goToStep(nextStep: number) {
    const capped = Math.max(0, Math.min(nextStep, 3));
    if (capped > step) {
      const isValid = await validateStep(capped);
      if (!isValid) {
        setFormBannerError("Please fix the errors below");
        setShake(true);
        setTimeout(() => setShake(false), 200);
        return;
      }
    }
    setFormBannerError("");
    setStep(capped);
  }

  function handleImageUpload(kind: "logo" | "banner", file: File | null) {
    if (!file) {
      if (kind === "logo") {
        setValue("logoPreview", "", { shouldValidate: true });
      } else {
        setValue("bannerPreview", "", { shouldValidate: true });
      }
      setUploadErrors((prev) => ({ ...prev, [kind]: undefined }));
      return;
    }
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setUploadErrors((prev) => ({ ...prev, [kind]: "Only JPG and PNG files are allowed." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadErrors((prev) => ({ ...prev, [kind]: "File size should be less than 5MB." }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const preview = reader.result as string;
      if (kind === "logo") {
        setValue("logoPreview", preview, { shouldValidate: true });
      } else {
        setValue("bannerPreview", preview, { shouldValidate: true });
      }
      setUploadErrors((prev) => ({ ...prev, [kind]: undefined }));
    };
    reader.readAsDataURL(file);
  }

  function discardDraft() {
    const shouldDiscard = window.confirm("Discard saved draft? This cannot be undone.");
    if (!shouldDiscard) return;

    localStorage.removeItem(DRAFT_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    window.location.reload();
  }

  async function saveDraftNow() {
    const payload = { ...getValues(), currentStep: step };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    await fetch("/api/storefront/create", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft: true, data: payload })
    });
  }

  async function submitAll() {
    const validBasic = await validateStep(1);
    const validBranding = await validateStep(2);
    const validPlan = await validateStep(3);
    if (!validBasic || !validBranding || !validPlan) {
      setFormBannerError("Please fix the errors below");
      setShake(true);
      setTimeout(() => setShake(false), 200);
      return;
    }

    setFormBannerError("");
    setIsSubmitting(true);
    const response = await fetch("/api/storefront/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(getValues())
    });
    const json = (await response.json()) as { success: boolean };
    setIsSubmitting(false);

    if (json.success) {
      setSuccessMessage("🎉 Your storefront is ready!");
      localStorage.removeItem(DRAFT_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
      return;
    }

    setFormBannerError("Something went wrong. Please try again.");
  }

  return (
    <main className="min-h-screen bg-[#f9f9f9] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[800px]">
        <header className="mb-4 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="rounded-lg border border-[#e0e0e0] bg-white px-4 py-2 text-sm font-semibold text-[#1a1a1a] transition duration-200 hover:bg-[#f0fffe]"
          >
            ← Back to Home
          </Link>
          <Link href="/login" className="text-sm font-semibold text-[#008080] transition hover:underline">
            Login
          </Link>
        </header>

        <h1 className="text-[32px] font-bold text-[#008080]">Sign up</h1>

        <div className="mt-5 rounded-xl border border-[#e0e0e0] bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {stepDefinitions.map((item, index) => {
              const isActive = step === index;
              const isCompleted = step > index;
              return (
                <div key={item.title} className="flex flex-1 items-start gap-2">
                  <button
                    type="button"
                    onClick={() => void goToStep(index)}
                    className="flex-1 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition duration-300",
                          isCompleted
                            ? "bg-[#27ae60] text-white"
                            : isActive
                              ? "bg-[#008080] text-white"
                              : "bg-[#f0f0f0] text-[#666]"
                        )}
                      >
                        {isCompleted ? "✓" : index + 1}
                      </span>
                      <span className={cn("text-xs font-semibold sm:text-sm", isActive ? "text-[#008080]" : "text-[#666]")}>
                        {item.title}
                      </span>
                    </div>
                    <div className="mt-1 pl-10 text-[11px] text-[#999]">
                      {item.substeps.join(" → ")}
                    </div>
                  </button>
                  {index < stepDefinitions.length - 1 ? (
                    <div
                      className={cn(
                        "mt-4 hidden h-0.5 w-10 self-start sm:block",
                        step > index ? "bg-[#27ae60]" : "border-t border-dashed border-[#d9d9d9]"
                      )}
                    />
                  ) : null}
                  </div>
              );
            })}
          </div>
        </div>

        {formBannerError ? (
          <div className={cn("mt-4 rounded-lg border border-[#e74c3c] bg-[#fdecea] px-4 py-3 text-sm text-[#e74c3c]", shake && "animate-shake")}>
            {formBannerError}
          </div>
        ) : null}

        <section className={cn("mt-4 rounded-xl border border-[#e0e0e0] bg-white p-5 shadow-sm sm:p-6", "animate-form-fade", shake && "animate-shake")}>
          <h2 className="text-[32px] font-bold text-[#008080]">{stepDefinitions[step].title}</h2>
          <p className="mt-1 text-sm text-[#666]">Step {step + 1} of 4</p>

          {step === 0 ? (
            <div className="mt-5 grid gap-4">
              <Field label="Business Name" required error={errors.businessName?.message}>
                <input {...register("businessName")} placeholder="Your Business Name" className={inputClass(Boolean(errors.businessName))} />
              </Field>

              <Field label="Category" required error={errors.category?.message}>
                <select {...register("category")} className={inputClass(Boolean(errors.category))}>
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="SubCategory" required error={errors.subCategory?.message}>
                <select {...register("subCategory")} className={inputClass(Boolean(errors.subCategory))}>
                  <option value="">Select SubCategory</option>
                  {selectedSubCategories.map((sub: string) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="State" required error={errors.state?.message}>
                  <select {...register("state")} className={inputClass(Boolean(errors.state))}>
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="City" required error={errors.city?.message}>
                  <select {...register("city")} className={inputClass(Boolean(errors.city))}>
                    <option value="">Select City</option>
                    {selectedCities.map((city: string) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
                <Field label="Code" required>
                  <select {...register("countryCode")} className={inputClass(false)}>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+91">+91</option>
                    <option value="+234">+234</option>
                  </select>
                </Field>
                <Field label="Phone Number" required error={errors.phoneNumber?.message}>
                  <input {...register("phoneNumber")} placeholder="123 456 7890" className={inputClass(Boolean(errors.phoneNumber))} />
                </Field>
              </div>

              <Field label="Email" required error={errors.email?.message}>
                <input {...register("email")} type="email" placeholder="your@email.com" className={inputClass(Boolean(errors.email))} />
              </Field>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <UploadField
                  label="Logo"
                  helper="Square, 200x200px minimum"
                  preview={values.logoPreview}
                  error={uploadErrors.logo ?? errors.logoPreview?.message}
                  onFile={(file) => handleImageUpload("logo", file)}
                />
                <UploadField
                  label="Cover Banner"
                  helper="1200x400px recommended"
                  preview={values.bannerPreview}
                  error={uploadErrors.banner ?? errors.bannerPreview?.message}
                  onFile={(file) => handleImageUpload("banner", file)}
                />
              </div>

              <Field
                label="Business Description"
                required
                helper={`${(values.brandingDescription ?? "").length}/500 characters`}
                error={errors.brandingDescription?.message}
              >
                <textarea
                  {...register("brandingDescription")}
                  rows={5}
                  placeholder="Describe your business"
                  className={inputClass(Boolean(errors.brandingDescription))}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Facebook URL" error={errors.facebook?.message}>
                  <input {...register("facebook")} placeholder="https://facebook.com/..." className={inputClass(Boolean(errors.facebook))} />
                </Field>
                <Field label="Twitter/X URL" error={errors.twitter?.message}>
                  <input {...register("twitter")} placeholder="https://x.com/..." className={inputClass(Boolean(errors.twitter))} />
                </Field>
                <Field label="Instagram URL" error={errors.instagram?.message}>
                  <input {...register("instagram")} placeholder="https://instagram.com/..." className={inputClass(Boolean(errors.instagram))} />
                </Field>
                <Field label="LinkedIn URL" error={errors.linkedin?.message}>
                  <input {...register("linkedin")} placeholder="https://linkedin.com/..." className={inputClass(Boolean(errors.linkedin))} />
                </Field>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {plans.map((plan) => {
                const isSelected = values.plan === plan.id;
                return (
                  <article
                    key={plan.id}
                    className={cn(
                      "rounded-xl border bg-white p-4 transition duration-300",
                      isSelected ? "border-[#008080] ring-2 ring-[#008080]/30" : "border-[#e0e0e0]"
                    )}
                  >
                    <h3 className="text-lg font-bold text-[#1a1a1a]">{plan.name}</h3>
                    <p className="mt-1 text-xl font-bold text-[#008080]">{plan.price}</p>
                    <ul className="mt-3 space-y-1 text-sm text-[#666]">
                      {plan.features.map((feature) => (
                        <li key={feature}>• {feature}</li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => setValue("plan", plan.id, { shouldValidate: true })}
                      className={cn(
                        "mt-4 w-full rounded-lg px-4 py-3 text-sm font-semibold transition duration-300",
                        isSelected
                          ? "bg-[#008080] text-white"
                          : "border border-[#e0e0e0] bg-white text-[#1a1a1a] hover:bg-[#f0fffe]"
                      )}
                    >
                      {isSelected ? "✓ Selected" : plan.cta}
                    </button>
                  </article>
                );
              })}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="mt-5 space-y-4">
              <ReviewBlock title="Business Info" onEdit={() => void goToStep(0)}>
                <ReviewItem label="Business Name" value={values.businessName ?? ""} />
                <ReviewItem label="Category" value={values.category ?? ""} />
                <ReviewItem label="SubCategory" value={values.subCategory ?? ""} />
                <ReviewItem label="Location" value={`${values.state ?? ""}, ${values.city ?? ""}`} />
                <ReviewItem label="Phone" value={`${values.countryCode ?? ""} ${values.phoneNumber ?? ""}`} />
                <ReviewItem label="Email" value={values.email ?? ""} />
              </ReviewBlock>

              <ReviewBlock title="Branding" onEdit={() => void goToStep(1)}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <PreviewCard label="Logo" src={values.logoPreview ?? ""} />
                  <PreviewCard label="Banner" src={values.bannerPreview ?? ""} />
                </div>
                <ReviewItem label="Description" value={values.brandingDescription ?? ""} />
                <ReviewItem label="Facebook" value={values.facebook || "N/A"} />
                <ReviewItem label="Twitter/X" value={values.twitter || "N/A"} />
                <ReviewItem label="Instagram" value={values.instagram || "N/A"} />
                <ReviewItem label="LinkedIn" value={values.linkedin || "N/A"} />
              </ReviewBlock>

              <ReviewBlock title="Plan" onEdit={() => void goToStep(2)}>
                <ReviewItem label="Selected Plan" value={`${currentPlan.toUpperCase()} (${planPriceMap[currentPlan]})`} />
              </ReviewBlock>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void saveDraftNow()}
                className="rounded-lg border border-[#e0e0e0] bg-[#f0f0f0] px-4 py-3 text-sm font-semibold text-[#1a1a1a] transition duration-200 hover:bg-[#f0fffe]"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={discardDraft}
                className="rounded-lg border border-[#e0e0e0] bg-white px-4 py-3 text-sm font-semibold text-[#666] transition duration-200 hover:bg-[#f9f9f9]"
              >
                Discard Draft
              </button>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => void goToStep(step - 1)}
                  className="rounded-lg border border-[#e0e0e0] bg-[#f0f0f0] px-5 py-3 text-sm font-semibold text-[#1a1a1a] transition duration-200 hover:bg-[#f0fffe]"
                >
                  Previous
                </button>
              ) : null}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => void goToStep(step + 1)}
                  disabled={!canContinueFromCurrentStep}
                  className="rounded-lg bg-[#008080] px-8 py-3 text-sm font-semibold text-white transition duration-200 hover:scale-[1.02] hover:bg-[#0a6d6d] disabled:opacity-50"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void submitAll()}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-lg bg-[#27ae60] px-10 py-3 text-base font-semibold text-white transition duration-200 hover:scale-[1.02] hover:bg-[#229954] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Submitting...
                    </>
                  ) : (
                    "Click Submit"
                  )}
                </button>
              )}
            </div>
          </div>

          {successMessage ? (
            <div className="animate-success-fade mt-4 rounded-lg border border-[#27ae60]/40 bg-[#eafaf1] px-4 py-3 text-sm font-semibold text-[#27ae60]">
              {successMessage}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function inputClass(hasError: boolean): string {
  return cn(
    "w-full rounded-lg border bg-white px-4 py-3 text-[16px] text-[#1a1a1a] transition duration-200",
    "hover:shadow-sm focus:scale-[1.01] focus:outline-none focus:shadow-sm",
    hasError ? "border-[#e74c3c]" : "border-[#e0e0e0] focus:border-[#008080]"
  );
}

function Field({
  label,
  required,
  helper,
  error,
  children
}: {
  label: string;
  required?: boolean;
  helper?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-[14px] font-semibold text-[#1a1a1a]">
        {label}
        {required ? <span className="ml-1 text-[#e74c3c]">*</span> : null}
      </label>
      {children}
      {error ? <p className="mt-1 text-[12px] text-[#e74c3c]">{error}</p> : null}
      {!error && helper ? <p className="mt-1 text-[12px] text-[#999]">{helper}</p> : null}
    </div>
  );
}

function UploadField({
  label,
  helper,
  preview,
  error,
  onFile
}: {
  label: string;
  helper: string;
  preview?: string;
  error?: string;
  onFile: (file: File | null) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-[14px] font-semibold text-[#1a1a1a]">
        {label}
        <span className="ml-1 text-[#e74c3c]">*</span>
      </label>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#008080] bg-[#f0fffe] p-6 text-center transition hover:shadow-sm">
        <span className="text-sm text-[#1a1a1a]">
          Drag and drop your file here or click to browse
        </span>
        <span className="mt-1 text-xs text-[#666]">Accepted: JPG, PNG (max 5MB)</span>
        <input
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={(event) => onFile(event.target.files?.[0] ?? null)}
        />
      </label>
      {preview ? (
        <div className="animate-form-fade mt-3">
          <Image
            src={preview}
            alt={`${label} preview`}
            width={150}
            height={150}
            unoptimized
            className="h-[150px] w-[150px] rounded-lg object-cover"
          />
          <button
            type="button"
            onClick={() => onFile(null)}
            className="mt-2 rounded-md border border-[#e0e0e0] px-3 py-1 text-xs font-semibold text-[#666] transition hover:bg-[#f0f0f0]"
          >
            Remove
          </button>
        </div>
      ) : null}
      {error ? <p className="mt-1 text-[12px] text-[#e74c3c]">{error}</p> : <p className="mt-1 text-[12px] text-[#999]">{helper}</p>}
    </div>
  );
}

function ReviewBlock({
  title,
  onEdit,
  children
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#e0e0e0] bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#1a1a1a]">{title}</h3>
        <button type="button" onClick={onEdit} className="text-sm font-semibold text-[#008080] hover:underline">
          Edit
        </button>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm text-[#666]">
      <span className="font-semibold text-[#1a1a1a]">{label}: </span>
      {value}
    </p>
  );
}

function PreviewCard({ label, src }: { label: string; src?: string }) {
  return (
    <div className="rounded-lg border border-[#e0e0e0] bg-[#f9f9f9] p-3">
      <p className="mb-2 text-sm font-semibold text-[#1a1a1a]">{label}</p>
      {src ? (
        <Image
          src={src}
          alt={`${label} preview`}
          width={600}
          height={120}
          unoptimized
          className="h-[120px] w-full rounded object-cover"
        />
      ) : (
        <div className="flex h-[120px] items-center justify-center rounded bg-white text-xs text-[#999]">No preview</div>
      )}
    </div>
  );
}
