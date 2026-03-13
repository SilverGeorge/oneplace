import { SignJWT, jwtVerify } from "jose";
import { env } from "@/lib/env";

export type AuthJwtPayload = {
  sub: string;
  email: string;
  name: string;
};

const encoder = new TextEncoder();

function getSecret(): Uint8Array {
  if (!env.jwtSecret) {
    throw new Error("JWT_SECRET is not set");
  }
  return encoder.encode(env.jwtSecret);
}

export async function signAuthToken(payload: AuthJwtPayload): Promise<string> {
  return new SignJWT({ email: payload.email, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${env.jwtExpiresIn}s`)
    .sign(getSecret());
}

export async function verifyAuthToken(token: string): Promise<AuthJwtPayload> {
  const { payload } = await jwtVerify(token, getSecret());

  if (!payload.sub || typeof payload.email !== "string" || typeof payload.name !== "string") {
    throw new Error("Invalid token payload");
  }

  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name
  };
}
