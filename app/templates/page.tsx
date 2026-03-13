import Navbar from "@/components/navbar";
import TemplatesSection from "@/components/templates-section";
import Footer from "@/components/footer";

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>
        <TemplatesSection />
      </main>
      <Footer />
    </div>
  );
}
