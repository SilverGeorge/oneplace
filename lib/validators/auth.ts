import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(128)
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(128)
});

export const passwordResetSchema = z.object({
  email: z.string().email().toLowerCase()
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().toLowerCase(),
  bio: z.string().max(500).optional().nullable(),
  avatarUrl: z.string().max(500).optional().nullable()
});
