import type { NextApiRequest, NextApiResponse } from "next";
import { createApiHandler } from "@/lib/api-handler";

export default createApiHandler(["GET"], async (_req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({
    success: true,
    data: {
      items: [
        {
          title: "Total Sales",
          value: "$45,230",
          delta: "+12.5%",
          helper: "vs. last month",
          icon: "sales"
        },
        {
          title: "Total Orders",
          value: "1,234",
          delta: "+8.2%",
          helper: "vs. last month",
          icon: "orders"
        },
        {
          title: "Active Products",
          value: "156",
          delta: "-24",
          helper: "24 out of stock warning",
          icon: "products"
        },
        {
          title: "Customer Satisfaction",
          value: "96%",
          delta: "+2%",
          helper: "vs. last month",
          icon: "satisfaction"
        }
      ],
      performance: {
        responseTime: "1h 16m",
        fulfillmentRate: "96.2%",
        returnRate: "1.8%",
        repeatRate: "43%"
      }
    }
  });
});
