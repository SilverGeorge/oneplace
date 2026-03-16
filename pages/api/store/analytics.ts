import type { NextApiRequest, NextApiResponse } from "next";
import { createApiHandler } from "@/lib/api-handler";

export default createApiHandler(["GET"], async (_req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({
    success: true,
    data: {
      analytics: {
        salesTrend: [
          { label: "Jan", value: 120 },
          { label: "Feb", value: 180 },
          { label: "Mar", value: 160 },
          { label: "Apr", value: 220 },
          { label: "May", value: 260 },
          { label: "Jun", value: 280 }
        ],
        orderVolume: [
          { label: "Jan", value: 80 },
          { label: "Feb", value: 96 },
          { label: "Mar", value: 88 },
          { label: "Apr", value: 104 },
          { label: "May", value: 132 },
          { label: "Jun", value: 148 }
        ],
        trafficSources: [
          { label: "Direct", value: 38, color: "#008080" },
          { label: "Social", value: 24, color: "#6366f1" },
          { label: "Search", value: 28, color: "#f59e0b" },
          { label: "Email", value: 10, color: "#27ae60" }
        ],
        topProducts: [
          { name: "Smartwatch Series X", orders: 540, revenue: "$134,460" },
          { name: "Urban Runner Sneaker", orders: 780, revenue: "$100,620" },
          { name: "Mirrorless Camera Pro", orders: 320, revenue: "$287,680" }
        ]
      }
    }
  });
});
