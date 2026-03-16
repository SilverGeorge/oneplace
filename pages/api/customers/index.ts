import type { NextApiRequest, NextApiResponse } from "next";
import { createApiHandler } from "@/lib/api-handler";

export default createApiHandler(["GET"], async (_req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({
    success: true,
    data: {
      items: [
        {
          id: "CUS-001",
          name: "John Doe",
          email: "john@example.com",
          phone: "+1 (555) 123-4567",
          avatar: "https://i.pravatar.cc/80?img=15",
          orders: 5,
          totalSpent: 1234.56,
          lastOrder: "Mar 10, 2024",
          status: "Active",
          address: "12 Ocean View, New York, USA"
        },
        {
          id: "CUS-002",
          name: "Sarah Jones",
          email: "sarah@example.com",
          phone: "+1 (555) 987-6543",
          avatar: "https://i.pravatar.cc/80?img=16",
          orders: 2,
          totalSpent: 420.19,
          lastOrder: "Mar 09, 2024",
          status: "Inactive",
          address: "55 Maple Drive, Austin, USA"
        },
        {
          id: "CUS-003",
          name: "Mike Stone",
          email: "mike@example.com",
          phone: "+1 (555) 222-8899",
          avatar: "https://i.pravatar.cc/80?img=17",
          orders: 8,
          totalSpent: 2544.0,
          lastOrder: "Mar 08, 2024",
          status: "Blocked",
          address: "88 Lake Road, Miami, USA"
        }
      ]
    }
  });
});
