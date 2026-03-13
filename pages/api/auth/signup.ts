import type { NextApiRequest, NextApiResponse } from "next";
import { createApiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/errors";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { signAuthToken } from "@/lib/auth/jwt";
import { serializeAuthCookie } from "@/lib/auth/cookie";
import { signupSchema } from "@/lib/validators/auth";
import { logger } from "@/lib/logger";

export default createApiHandler(["POST"], async (req: NextApiRequest, res: NextApiResponse) => {
  logger.info("Signup request body", { body: req.body });

  const payload = signupSchema.parse(req.body);
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email }
  });

  if (existingUser) {
    throw new ApiError(409, "EMAIL_IN_USE", "Email is already in use");
  }

  const passwordHash = await hashPassword(payload.password);
  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      passwordHash
    }
  });

  const token = await signAuthToken({
    sub: user.id,
    email: user.email,
    name: user.name
  });

  res.setHeader("Set-Cookie", serializeAuthCookie(token));
  res.status(201).json({
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
