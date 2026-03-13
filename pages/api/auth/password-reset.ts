import { randomUUID } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { createApiHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/db";
import { passwordResetSchema } from "@/lib/validators/auth";
import { logger } from "@/lib/logger";
import { env } from "@/lib/env";

export default createApiHandler(["POST"], async (req: NextApiRequest, res: NextApiResponse) => {
  logger.info("Password reset request body", { body: req.body });

  const payload = passwordResetSchema.parse(req.body);
  const user = await prisma.user.findUnique({
    where: { email: payload.email }
  });

  if (user) {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    });

    logger.info("Generated password reset token", {
      userId: user.id,
      resetLink: `${env.resetPasswordUrl}?token=${token}`
    });
  }

  res.status(200).json({
    success: true,
    data: {
      message: "If an account exists for that email, a password reset link has been generated."
    }
  });
});
