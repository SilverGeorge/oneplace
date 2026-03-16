import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { createApiHandler } from "@/lib/api-handler";

const updateSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  description: z.string().min(10),
  email: z.string().email(),
  phone: z.string().min(5),
  website: z.string().url().or(z.literal("")),
  status: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional()
});

export default createApiHandler(["PUT"], async (req: NextApiRequest, res: NextApiResponse) => {
  updateSchema.parse(req.body);
  res.status(200).json({
    success: true,
    data: {
      message: "Store updated successfully"
    }
  });
});
