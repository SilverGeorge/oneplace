import type { NextApiRequest } from "next";
import { parse } from "cookie";
import { ApiError } from "@/lib/errors";
import { verifyAuthToken, type AuthJwtPayload } from "@/lib/auth/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookie";

function getBearerToken(req: NextApiRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice("Bearer ".length).trim();
}

function getCookieToken(req: NextApiRequest): string | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const cookies = parse(cookieHeader);
  return cookies[AUTH_COOKIE_NAME] ?? null;
}

export async function requireAuth(req: NextApiRequest): Promise<AuthJwtPayload> {
  const token = getBearerToken(req) ?? getCookieToken(req);
  if (!token) {
    throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
  }

  try {
    return await verifyAuthToken(token);
  } catch {
    throw new ApiError(401, "INVALID_TOKEN", "Invalid or expired token");
  }
}
