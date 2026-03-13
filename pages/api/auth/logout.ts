import type { NextApiRequest, NextApiResponse } from "next";
import { createApiHandler } from "@/lib/api-handler";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookie";

export default createApiHandler(["POST"], async (_req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader(
    "Set-Cookie",
    `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; ${
      process.env.NODE_ENV === "production" ? "Secure;" : ""
    }`
  );

  res.status(200).json({
    success: true,
    data: {
      message: "Logged out successfully"
    }
  });
});
