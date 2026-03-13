"use client";

import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();

  return (
    <section
      className="hero-bg min-h-screen"
      style={{
        backgroundImage: "url('/images/heroimage1.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        fontFamily: "Plus Jakarta Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif"
      }}
    >
      <div className="relative flex min-h-screen items-center justify-center">
        <div className="absolute inset-0 bg-black/35" />
        <div className="container-main animate-hero-fade relative z-10 mx-auto max-w-[600px] text-center">
          <h1 
            className="text-[44px] font-bold leading-[1.2] text-slate-50 md:text-[56px] lg:text-[72px]"
            style={{
              fontFamily: "Plus Jakarta Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
              fontWeight: 800,
              letterSpacing: "-0.02em"
            }}
          >
            Created for Every Vendor
          </h1>
          <p 
            className="mx-auto mt-5 text-[18px] font-normal leading-[1.5] text-slate-100 md:text-[19px] lg:text-[20px]"
            style={{
              fontFamily: "Plus Jakarta Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif"
            }}
          >
            Connect with top brands, digital services, and businesses. 
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-5 sm:flex-row">
            <button 
              className="min-h-11 rounded-xl bg-[#008080] p-4 font-semibold text-white transition duration-300 hover:scale-105"
              onClick={() => router.push("/signup")}
              style={{
                fontFamily: "Plus Jakarta Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif"
              }}
            >
              Create Account
            </button>
            <button 
              className="min-h-11 rounded-xl border border-[#008080] bg-transparent p-4 font-semibold text-slate-100 transition duration-300 hover:scale-105"
              onClick={() => router.push("/login")}
              style={{
                fontFamily: "Plus Jakarta Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif"
              }}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}