import type { NextApiRequest, NextApiResponse } from "next";
import { createApiHandler } from "@/lib/api-handler";

export default createApiHandler(["GET"], async (_req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({
    success: true,
    data: {
      items: [
        {
          id: "p1",
          image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
          name: "Smartwatch Series X",
          price: "$249.00",
          salesCount: 540,
          rating: 4.8,
          stock: "In stock"
        },
        {
          id: "p2",
          image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80",
          name: "Mirrorless Camera Pro",
          price: "$899.00",
          salesCount: 320,
          rating: 4.7,
          stock: "Low stock"
        },
        {
          id: "p3",
          image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
          name: "Urban Runner Sneaker",
          price: "$129.00",
          salesCount: 780,
          rating: 4.9,
          stock: "Out of stock"
        }
      ]
    }
  });
});
