import { z } from "zod";

export const registerSchema = z.object({
    name: z
        .string()
        .min(1)
        .max(255)
        .transform((s) => s.trim()),
    email: z.email().transform((s) => s.toLowerCase()),
    password: z.string().min(6).max(255),
});

export const loginSchema = z.object({
    email: z.email().transform((s) => s.toLowerCase()),
    password: z.string().min(1),
});
