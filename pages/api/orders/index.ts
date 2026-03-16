import type { NextApiRequest, NextApiResponse } from "next";
import { createApiHandler } from "@/lib/api-handler";

export default createApiHandler(["GET"], async (_req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({
    success: true,
    data: {
      items: [
        {
          id: "ORD-2024-001",
          customer: "John Doe",
          email: "john@example.com",
          amount: 245.99,
          items: 3,
          status: "Pending",
          date: "Mar 10, 2024",
          shippingAddress: "12 Ocean View, New York, USA",
          trackingNumber: "TRK-001",
          notes: "Handle with care"
        },
        {
          id: "ORD-2024-002",
          customer: "Sarah Jones",
          email: "sarah@example.com",
          amount: 589.2,
          items: 5,
          status: "Processing",
          date: "Mar 11, 2024",
          shippingAddress: "55 Maple Drive, Austin, USA",
          trackingNumber: "TRK-002",
          notes: ""
        },
        {
          id: "ORD-2024-003",
          customer: "Mike Stone",
          email: "mike@example.com",
          amount: 98.5,
          items: 1,
          status: "Delivered",
          date: "Mar 08, 2024",
          shippingAddress: "88 Lake Road, Miami, USA",
          trackingNumber: "TRK-003",
          notes: ""
        }
      ]
    }
  });
});
