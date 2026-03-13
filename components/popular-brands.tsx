"use client";

import Image from "next/image";
import { useState } from "react";

type Brand = {
  name: string;
  image: string;
  description: string;
};

const brands: Brand[] = [
  {
    name: "NovaCorp",
    image: "/images/brand1.jpg",
    description: "Premium retail solutions built for fast-growing online vendors."
  },
  {
    name: "PixelTrade",
    image: "/images/brand2.jpg",
    description: "Digital commerce services that improve visibility and conversions."
  },
  {
    name: "CloudPrime",
    image: "/images/brand3.jpg",
    description: "Reliable cloud infrastructure and automation for modern marketplaces."
  },
  {
    name: "RocketPay",
    image: "/images/brand4.jpg",
    description: "Secure payments and checkout tools designed for customer trust."
  },
  {
    name: "MarketLoop",
    image: "/images/brand5.jpg",
    description: "Listing and catalog management solutions that scale with your business."
  },
  {
    name: "UrbanNest",
    image: "/images/brand6.jpg",
    description: "Lifestyle brand collaboration and merchandising support made simple."
  }
];

export default function PopularBrands() {
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});

  return (
    <section className="container-main py-10 sm:py-12 lg:py-16">
      <h2 className="text-center text-[40px] font-bold text-slate-900">Popular Brands</h2>
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => (
          <article
            key={brand.name}
            className="overflow-hidden rounded-2xl border border-[#e0e0e0] bg-[#fff] shadow-sm transition duration-300 hover:-translate-y-[6px] hover:shadow-xl"
          >
            <div className="relative h-[200px] w-full bg-slate-100">
              {imageErrorMap[brand.name] ? (
                <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
                  Image unavailable
                </div>
              ) : (
                <Image
                  src={brand.image}
                  alt={brand.name}
                  fill
                  unoptimized
                  className="object-cover"
                  onError={() => setImageErrorMap((prev) => ({ ...prev, [brand.name]: true }))}
                />
              )}
            </div>
            <div className="p-4">
              <h3 className="text-[16px] font-bold text-[#1a1a1a]">{brand.name}</h3>
              <p className="mt-2 overflow-hidden text-[14px] font-normal text-[#666666] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                {brand.description}
              </p>
              <button className="mt-4 w-full rounded-lg bg-[#008080] px-4 py-3 text-[14px] font-semibold text-white transition duration-300 hover:scale-105 hover:shadow-lg">
                Visit Store
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
