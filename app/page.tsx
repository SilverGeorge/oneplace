import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import PopularBrands from "@/components/popular-brands";
import Categories from "@/components/categories";
import TemplatesSection from "@/components/templates-section";
import PricingTiers from "@/components/pricing-tiers";
import FAQ from "@/components/faq";
import CTACard from "@/components/cta-card";
import Footer from "@/components/footer";
import SectionReveal from "@/components/section-reveal";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>
        <SectionReveal>
          <Hero />
        </SectionReveal>
        <SectionReveal>
          <PopularBrands />
        </SectionReveal>
        <SectionReveal>
          <Categories />
        </SectionReveal>
        <SectionReveal>
          <TemplatesSection />
        </SectionReveal>
        <SectionReveal>
          <PricingTiers />
        </SectionReveal>
        <SectionReveal>
          <FAQ />
        </SectionReveal>
        <SectionReveal>
          <CTACard />
        </SectionReveal>
      </main>
      <Footer />
    </div>
  );
}
