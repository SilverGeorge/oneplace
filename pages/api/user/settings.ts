import type { NextApiRequest, NextApiResponse } from "next";
import { createApiHandler } from "@/lib/api-handler";

export default createApiHandler(
  ["GET", "PUT"],
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "GET") {
      res.status(200).json({
        success: true,
        data: {
          twoFaEnabled: false,
          settings: {
            firstName: "Jon",
            lastName: "Smith",
            email: "jon.smith@example.com",
            phone: "+1 (555) 100-2222",
            storeName: "Biko Lifestyle Hub",
            category: "Lifestyle Marketplace",
            description: "Curated lifestyle products for modern shoppers.",
            website: "https://bikostore.com",
            timezone: "America/New_York",
            currency: "USD",
            notifications: {
              email: true,
              order: true,
              review: true,
              promo: false,
              weekly: true,
              daily: false
            }
          }
        }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { message: "Settings updated successfully" }
    });
  }
);
