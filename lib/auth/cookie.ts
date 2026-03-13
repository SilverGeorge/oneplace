export const AUTH_COOKIE_NAME = "oneplace_token";

export function serializeAuthCookie(token: string): string {
  const maxAge = Number(process.env.JWT_EXPIRES_IN ?? 3600);
  return `${AUTH_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; ${
    process.env.NODE_ENV === "production" ? "Secure;" : ""
  }`;
}
