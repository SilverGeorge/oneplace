function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const jwtExpiresRaw = process.env.JWT_EXPIRES_IN ?? "3600";
const bcryptRoundsRaw = process.env.BCRYPT_SALT_ROUNDS ?? "10";

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
  jwtExpiresIn: Number(jwtExpiresRaw),
  bcryptSaltRounds: Number(bcryptRoundsRaw),
  resetPasswordUrl: process.env.RESET_PASSWORD_URL ?? "http://localhost:3000/auth/reset-password"
};

export function assertRequiredEnv(): void {
  requireEnv("DATABASE_URL");
  requireEnv("JWT_SECRET");
}
