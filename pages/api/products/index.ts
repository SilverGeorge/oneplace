import type { NextApiRequest, NextApiResponse } from "next";
import { createApiHandler } from "@/lib/api-handler";

const products = [
  {
    id: "PRD-001",
    name: "Wireless Earbuds Pro",
    sku: "SKU-001",
    category: "Electronics",
    price: 99.99,
    stock: 45,
    status: "Active",
    rating: 4.8,
    reviews: 234,
    sold: 1234,
    dateAdded: "Mar 10, 2024",
    image: "https://picsum.photos/200?random=31"
  },
  {
    id: "PRD-002",
    name: "Cotton Hoodie",
    sku: "SKU-002",
    category: "Clothing",
    price: 59.5,
    stock: 8,
    status: "Active",
    rating: 4.6,
    reviews: 98,
    sold: 422,
    dateAdded: "Mar 08, 2024",
    image: "https://picsum.photos/200?random=32"
  },
  {
    id: "PRD-003",
    name: "Organic Granola Pack",
    sku: "SKU-003",
    category: "Food",
    price: 12.99,
    stock: 0,
    status: "Out of Stock",
    rating: 4.4,
    reviews: 48,
    sold: 301,
    dateAdded: "Mar 01, 2024",
    image: "https://picsum.photos/200?random=33"
  },
  {
    id: "PRD-004",
    name: "Draft Product Sample",
    sku: "SKU-004",
    category: "Beauty",
    price: 29.99,
    stock: 20,
    status: "Draft",
    rating: undefined,
    reviews: 0,
    sold: 0,
    dateAdded: "Feb 27, 2024",
    image: "https://picsum.photos/200?random=34"
  }
];

export default createApiHandler(
  ["GET", "POST"],
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "GET") {
      res.status(200).json({
        success: true,
        data: { items: products }
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: {
        message: "Product created successfully",
        item: {
          id: `PRD-${Date.now()}`,
          ...req.body
        }
      }
    });
  }
);
