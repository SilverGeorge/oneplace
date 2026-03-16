export type TemplateBadge = "FREE" | "PREMIUM" | "POPULAR";
export type TemplateCategory = "Retail" | "Marketplace" | "Fashion" | "Food" | "Tech" | "Services";

export type TemplatePalette = {
  primary: string;
  accent: string;
  background: string;
  text: string;
};

export type StorefrontTemplate = {
  id: string;
  name: string;
  description: string;
  image: string;
  features: string[];
  badge: TemplateBadge;
  category: TemplateCategory;
  rating: number;
  users: number;
  palette: TemplatePalette;
};

export type StorefrontTemplateConfig = {
  templateId: string;
  templateName: string;
  colors: TemplatePalette;
  fontFamily?: "Plus Jakarta Sans" | "Inter" | "Poppins" | "Montserrat";
  layout?: "grid" | "sidebar" | "full";
  storeName?: string;
  storeDescription?: string;
  navigationItems?: string[];
  footerText?: string;
  footerLinks?: string[];
  coverImage?: string;
  logoImage?: string;
  customProducts?: Array<{
    id: string;
    name: string;
    category: string;
    isNew?: boolean;
    isBestSeller?: boolean;
    price: number;
    stock: number;
    rating: number;
    reviews: number;
    sold: number;
    description: string;
    image: string;
    variants: {
      sizes: string[];
      colors: string[];
    };
  }>;
};

export const STOREFRONT_TEMPLATE_CONFIG_KEY = "storefront-template-config";

export const storefrontTemplates: StorefrontTemplate[] = [
  {
    id: "minimal-store",
    name: "Minimal Store",
    description: "Simple and elegant storefront for clean product presentation.",
    image: "/images/template-minimal.jpg",
    features: ["Fast loading", "Clean cards", "Simple navigation", "Mobile-first"],
    badge: "FREE",
    category: "Retail",
    rating: 4.7,
    users: 1200,
    palette: { primary: "#008080", accent: "#ffc300", background: "#f8fffe", text: "#1a1a1a" }
  },
  {
    id: "professional-market",
    name: "Professional Market",
    description: "Built for multi-vendor catalogs with strong conversion sections.",
    image: "/images/template-professional.jpg",
    features: ["Vendor-focused layout", "Trust sections", "Conversion blocks", "Review modules"],
    badge: "PREMIUM",
    category: "Marketplace",
    rating: 4.8,
    users: 2500,
    palette: { primary: "#0f766e", accent: "#f59e0b", background: "#f0fdfa", text: "#0f172a" }
  },
  {
    id: "fashion-boutique",
    name: "Fashion Boutique",
    description: "Editorial design for fashion, beauty, and lifestyle brands.",
    image: "/images/template-fashion.jpg",
    features: ["Lookbook sections", "Hero storytelling", "Trend strips", "Style cards"],
    badge: "PREMIUM",
    category: "Fashion",
    rating: 4.9,
    users: 1800,
    palette: { primary: "#7c3aed", accent: "#f472b6", background: "#faf5ff", text: "#1f1235" }
  },
  {
    id: "food-grocery",
    name: "Food & Grocery",
    description: "Quick-order storefront for restaurants and grocery delivery.",
    image: "/images/template-food.jpg",
    features: ["Menu-first design", "Speed checkout", "Delivery callouts", "Category chips"],
    badge: "FREE",
    category: "Food",
    rating: 4.6,
    users: 1400,
    palette: { primary: "#dc2626", accent: "#f59e0b", background: "#fff7ed", text: "#1f2937" }
  },
  {
    id: "tech-electronics",
    name: "Tech & Electronics",
    description: "Modern spec-driven layout for gadgets and accessories.",
    image: "/images/template-tech.jpg",
    features: ["Spec blocks", "Comparison ready", "Filter-first UX", "Ratings highlight"],
    badge: "POPULAR",
    category: "Tech",
    rating: 4.8,
    users: 2500,
    palette: { primary: "#2563eb", accent: "#14b8a6", background: "#eff6ff", text: "#111827" }
  },
  {
    id: "services-marketplace",
    name: "Services Marketplace",
    description: "Booking-friendly storefront for services and professionals.",
    image: "/images/template-services.jpg",
    features: ["Booking CTA", "Service cards", "Availability states", "Trust badges"],
    badge: "PREMIUM",
    category: "Services",
    rating: 4.8,
    users: 2100,
    palette: { primary: "#0ea5e9", accent: "#8b5cf6", background: "#f0f9ff", text: "#082f49" }
  }
];

export function getTemplateById(id: string): StorefrontTemplate | undefined {
  return storefrontTemplates.find((template) => template.id === id);
}
