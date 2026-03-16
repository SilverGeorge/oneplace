import type { NextApiRequest, NextApiResponse } from "next";
import { createApiHandler } from "@/lib/api-handler";

export default createApiHandler(["GET"], async (_req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({
    success: true,
    data: {
      items: [
        {
          id: "r5",
          customer: "Wade Warren",
          avatar: "https://i.pravatar.cc/60?img=14",
          rating: 5,
          text: "Amazing product quality and very quick delivery. The store support team was also very responsive.",
          date: "Mar 11, 2026",
          helpful: 34
        },
        {
          id: "r4",
          customer: "Ronald Richards",
          avatar: "https://i.pravatar.cc/60?img=22",
          rating: 4,
          text: "Great prices and easy checkout flow. Packaging was good, delivery arrived on time.",
          date: "Mar 10, 2026",
          helpful: 19
        },
        {
          id: "r3",
          customer: "Kristin Watson",
          avatar: "https://i.pravatar.cc/60?img=32",
          rating: 5,
          text: "I love the variety available in this store and the product quality has been very consistent.",
          date: "Mar 9, 2026",
          helpful: 27
        },
        {
          id: "r2",
          customer: "Courtney Henry",
          avatar: "https://i.pravatar.cc/60?img=41",
          rating: 4,
          text: "Good customer service and smooth experience overall. I will shop again.",
          date: "Mar 8, 2026",
          helpful: 8
        },
        {
          id: "r1",
          customer: "Jacob Jones",
          avatar: "https://i.pravatar.cc/60?img=52",
          rating: 3,
          text: "Product is good, but delivery took longer than expected.",
          date: "Mar 6, 2026",
          helpful: 5
        }
      ]
    }
  });
});
