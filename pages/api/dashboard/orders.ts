import type { NextApiRequest, NextApiResponse } from "next";
import { createApiHandler } from "@/lib/api-handler";

export default createApiHandler(["GET"], async (_req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({
    success: true,
    data: {
      items: [
        {
          id: "1001",
          customer: "Wade Warren",
          item: "DJI Mavic Pro 2",
          amount: "$990.00",
          paymentMethod: "Card",
          status: "Completed",
          orderedAt: "12 Mar 2026"
        },
        {
          id: "1002",
          customer: "Ronald Richards",
          item: "AeroNoise Headset",
          amount: "$320.00",
          paymentMethod: "PayPal",
          status: "Pending",
          orderedAt: "11 Mar 2026"
        },
        {
          id: "1003",
          customer: "Kristin Watson",
          item: "FitPulse Smartwatch",
          amount: "$240.00",
          paymentMethod: "Card",
          status: "Completed",
          orderedAt: "10 Mar 2026"
        },
        {
          id: "1004",
          customer: "Guy Hawkins",
          item: "Nimbus Keyboard",
          amount: "$140.00",
          paymentMethod: "Bank transfer",
          status: "Cancelled",
          orderedAt: "09 Mar 2026"
        }
      ]
    }
  });
});
