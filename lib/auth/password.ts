import bcrypt from "bcryptjs";
import { env } from "@/lib/env";

export async function hashPassword(rawPassword: string): Promise<string> {
  return bcrypt.hash(rawPassword, env.bcryptSaltRounds);
}

export async function comparePassword(rawPassword: string, hash: string): Promise<boolean> {
  return bcrypt.compare(rawPassword, hash);
}
