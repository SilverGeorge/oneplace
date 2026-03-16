import type { NextApiRequest, NextApiResponse } from "next";
import { createApiHandler } from "@/lib/api-handler";

export default createApiHandler(["GET"], async (_req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({
    success: true,
    data: {
      items: [
        {
          id: "a1",
          title: "Store settings updated",
          detail: "Business hours changed from 8AM-6PM to 8AM-8PM.",
          timestamp: "10 mins ago"
        },
        {
          id: "a2",
          title: "New order received",
          detail: "Order #ORD-2024-001 from Wade Warren.",
          timestamp: "35 mins ago"
        },
        {
          id: "a3",
          title: "Account login detected",
          detail: "Signed in from a trusted device.",
          timestamp: "1 hour ago"
        },
        {
          id: "a4",
          title: "New review submitted",
          detail: "Ronald Richards left a 5-star review.",
          timestamp: "2 hours ago"
        }
      ]
    }
  });
});
