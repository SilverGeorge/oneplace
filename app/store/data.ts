export type StoreProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  stock: number;
  rating: number;
  reviews: number;
  sold: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  description: string;
  image: string;
  variants: {
    sizes: string[];
    colors: string[];
  };
};

export const storeProducts: StoreProduct[] = [
  {
    id: "p1",
    name: "Wireless Earbuds Pro",
    category: "Electronics",
    price: 99.99,
    oldPrice: 129.99,
    stock: 24,
    rating: 4.8,
    reviews: 234,
    sold: 1234,
    isBestSeller: true,
    description: "Premium earbuds with noise cancellation and long battery life.",
    image: "https://picsum.photos/600/420?random=101",
    variants: { sizes: ["Standard"], colors: ["Black", "White", "Blue"] }
  },
  {
    id: "p2",
    name: "4K Smart Monitor",
    category: "Electronics",
    price: 349.0,
    stock: 12,
    rating: 4.7,
    reviews: 89,
    sold: 420,
    isNew: true,
    description: "Ultra-clear display perfect for work and gaming setups.",
    image: "https://picsum.photos/600/420?random=102",
    variants: { sizes: ['27"', '32"'], colors: ["Black"] }
  },
  {
    id: "p3",
    name: "Mechanical Keyboard",
    category: "Accessories",
    price: 119.5,
    stock: 31,
    rating: 4.6,
    reviews: 154,
    sold: 870,
    isBestSeller: true,
    description: "Tactile switches, RGB lighting, and premium aluminum body.",
    image: "https://picsum.photos/600/420?random=103",
    variants: { sizes: ["TKL", "Full"], colors: ["Black", "Gray"] }
  },
  {
    id: "p4",
    name: "USB-C Docking Station",
    category: "Accessories",
    price: 79.0,
    stock: 44,
    rating: 4.5,
    reviews: 67,
    sold: 312,
    description: "Expand your laptop ports with HDMI, USB, ethernet and power.",
    image: "https://picsum.photos/600/420?random=104",
    variants: { sizes: ["Standard"], colors: ["Space Gray"] }
  }
];

export function getProductById(id: string): StoreProduct | undefined {
  return storeProducts.find((item) => item.id === id);
}
