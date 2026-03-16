import type { NextApiRequest, NextApiResponse } from "next";
import { createApiHandler } from "@/lib/api-handler";

export default createApiHandler(["GET"], async (_req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({
    success: true,
    data: {
      items: [
        {
          id: "h1",
          label: "Store profile is complete",
          status: "completed"
        },
        {
          id: "h2",
          label: "Payment method configured",
          status: "completed"
        },
        {
          id: "h3",
          label: "Add shipping policy",
          status: "warning",
          actionLabel: "Set up now"
        },
        {
          id: "h4",
          label: "Add at least 5 in-stock products",
          status: "warning",
          actionLabel: "Manage products"
        }
      ]
    }
  });
});
