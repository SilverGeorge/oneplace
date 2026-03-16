import type { NextApiRequest, NextApiResponse } from "next";
import { createApiHandler } from "@/lib/api-handler";

const categories = [
  {
    id: "CAT-001",
    name: "Electronics",
    parentCategory: "Technology",
    slug: "electronics",
    status: "Active",
    createdAt: "Mar 10, 2024",
    productCount: 45
  },
  {
    id: "CAT-002",
    name: "Clothing",
    parentCategory: "Fashion",
    slug: "clothing",
    status: "Active",
    createdAt: "Mar 09, 2024",
    productCount: 37
  },
  {
    id: "CAT-003",
    name: "Food",
    parentCategory: null,
    slug: "food",
    status: "Active",
    createdAt: "Mar 07, 2024",
    productCount: 22
  },
  {
    id: "CAT-004",
    name: "Beauty",
    parentCategory: null,
    slug: "beauty",
    status: "Inactive",
    createdAt: "Feb 28, 2024",
    productCount: 10
  }
];

export default createApiHandler(
  ["GET", "POST"],
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "GET") {
      res.status(200).json({
        success: true,
        data: { items: categories }
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: {
        message: "Category created",
        item: {
          id: `CAT-${Date.now()}`,
          ...req.body
        }
      }
    });
  }
);
