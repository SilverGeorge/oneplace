import type { NextApiRequest, NextApiResponse } from "next";
import { createApiHandler } from "@/lib/api-handler";

export default createApiHandler(["GET"], async (_req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({
    success: true,
    data: {
      items: [
        { label: "Total Users", value: "11,580", trend: "+5.9%", trendDirection: "up", icon: "users" },
        { label: "Total Orders", value: "45,580", trend: "+10.9%", trendDirection: "up", icon: "orders" },
        { label: "Total Vendors", value: "8,580", trend: "-3.9%", trendDirection: "down", icon: "vendors" },
        { label: "Total Earnings", value: "$51,580", trend: "+5.9%", trendDirection: "up", icon: "earnings" }
      ]
    }
  });
});
