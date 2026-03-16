import type { NextApiRequest, NextApiResponse } from "next";
import { createApiHandler } from "@/lib/api-handler";
import { logger } from "@/lib/logger";

export default createApiHandler(
  ["POST", "PUT"],
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "PUT") {
      logger.info("Storefront draft auto-save", { body: req.body });
      res.status(200).json({
        success: true,
        data: {
          message: "Draft saved successfully"
        }
      });
      return;
    }

    logger.info("Storefront create submit", { body: req.body });
    res.status(201).json({
      success: true,
      data: {
        storefrontId: "store_" + Date.now(),
        redirectUrl: "/dashboard"
      }
    });
  }
);
