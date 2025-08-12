import { z } from "zod";
import { APIResponse } from "./common.schemas.js";

// Shared types
export type AuthUser = {
    id: string;
    name: string;
    email: string;
};

export type AuthUserWithToken = {
    token: string;
    user: AuthUser;
};

export type JwtUserPayload = {
    sub: string;
    email?: string;
    name?: string;
};

// Register
export const registerSchema = z.object({
    name: z
        .string()
        .min(1)
        .max(255)
        .transform((s) => s.trim()),
    email: z.email().transform((s) => s.toLowerCase()),
    password: z.string().min(6).max(255),
});
export type AuthRegisterRequest = z.infer<typeof registerSchema>;
export type AuthRegisterResponse = APIResponse<AuthUserWithToken>;

// Login
export const loginSchema = z.object({
    email: z.email().transform((s) => s.toLowerCase()),
    password: z.string().min(1),
});
export type AuthLoginRequest = z.infer<typeof loginSchema>;
export type AuthLoginResponse = APIResponse<AuthUserWithToken>;

// Me
export type AuthMeRequest = {};
export type AuthMeResponse = APIResponse<AuthUser>;
