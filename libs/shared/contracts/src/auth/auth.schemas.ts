import { z } from "zod";

import { MIN_PASSWORD_LENGTH } from "./auth.constants";

export const signUpSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z
    .string()
    .trim()
    .pipe(z.email({ error: "Enter a valid email" })),
  password: z
    .string()
    .min(
      MIN_PASSWORD_LENGTH,
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    ),
});

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .pipe(z.email({ error: "Enter a valid email" })),
  password: z.string().min(1, "Password is required"),
});

export const authUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const authTokenResponseSchema = z.object({
  accessToken: z.string().min(1),
  user: authUserSchema,
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthTokenResponse = z.infer<typeof authTokenResponseSchema>;
