import type { NextApiRequest, NextApiResponse } from "next";
import { createApiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/errors";
import { prisma } from "@/lib/db";
import { comparePassword } from "@/lib/auth/password";
import { signAuthToken } from "@/lib/auth/jwt";
import { serializeAuthCookie } from "@/lib/auth/cookie";
import { loginSchema } from "@/lib/validators/auth";
import { logger } from "@/lib/logger";

export default createApiHandler(["POST"], async (req: NextApiRequest, res: NextApiResponse) => {
  logger.info("Login request body", { body: req.body });

  const payload = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({
    where: { email: payload.email }
  });

  if (!user) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid credentials");
  }

  const isValidPassword = await comparePassword(payload.password, user.passwordHash);
  if (!isValidPassword) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid credentials");
  }

  const token = await signAuthToken({
    sub: user.id,
    email: user.email,
    name: user.name
  });

  res.setHeader("Set-Cookie", serializeAuthCookie(token));
  res.status(200).json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        avatarUrl: user.avatarUrl
      }
    }
  });
});
