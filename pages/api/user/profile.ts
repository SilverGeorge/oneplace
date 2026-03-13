import type { NextApiRequest, NextApiResponse } from "next";
import { createApiHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { profileUpdateSchema } from "@/lib/validators/auth";
import { ApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export default createApiHandler(["GET", "PUT"], async (req: NextApiRequest, res: NextApiResponse) => {
  const authUser = await requireAuth(req);

  if (req.method === "GET") {
    const user = await prisma.user.findUnique({
      where: { id: authUser.sub },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatarUrl: true
      }
    });

    if (!user) {
      throw new ApiError(404, "USER_NOT_FOUND", "User not found");
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
    return;
  }

  logger.info("Profile update request body", { body: req.body, userId: authUser.sub });
  const payload = profileUpdateSchema.parse(req.body);

  const existingEmail = await prisma.user.findFirst({
    where: {
      email: payload.email,
      NOT: { id: authUser.sub }
    }
  });

  if (existingEmail) {
    throw new ApiError(409, "EMAIL_IN_USE", "Email is already in use");
  }

  const updatedUser = await prisma.user.update({
    where: { id: authUser.sub },
    data: {
      name: payload.name,
      email: payload.email,
      bio: payload.bio ?? null,
      avatarUrl: payload.avatarUrl ?? null
    },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      avatarUrl: true
    }
  });

  res.status(200).json({
    success: true,
    data: {
      user: updatedUser
    }
  });
});
