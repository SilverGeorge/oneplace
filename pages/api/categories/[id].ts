import type { NextApiRequest, NextApiResponse } from "next";
import { createApiHandler } from "@/lib/api-handler";

export default createApiHandler(
  ["PUT", "DELETE"],
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "PUT") {
      res.status(200).json({
        success: true,
        data: { message: `Category ${req.query.id} updated`, item: req.body }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { message: `Category ${req.query.id} deleted` }
    });
  }
);
