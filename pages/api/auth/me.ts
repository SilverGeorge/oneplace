import type { NextApiRequest, NextApiResponse } from "next";
import { createApiHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { ApiError } from "@/lib/errors";

export default createApiHandler(["GET"], async (req: NextApiRequest, res: NextApiResponse) => {
  const authUser = await requireAuth(req);
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
});
