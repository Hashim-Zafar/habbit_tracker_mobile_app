import { z } from "zod";

export const registerValidator = z.object({
  email: z.email(),
  password: z
    .string()
    .min(8, "password must be at least 8 characters")
    .max(20, "password must be at most 20 characeters"),
  name: z
    .string()
    .min(2, "name must be at least 2 characters")
    .max(30, "name must be max 30 characters"),
});

export const loginValidator = z.object({
  email: z.email(),
  password: z
    .string()
    .min(8, "password must be at least 8 characters")
    .max(30, "password must be at most 30 characters"),
});

export const refreshtokenValidator = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});
