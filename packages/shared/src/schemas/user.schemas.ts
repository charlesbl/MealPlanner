import { z } from "zod";
import type { AuthUser } from "./auth.schemas.js";
import { APIResponse } from "./common.schemas.js";

export const updateUserSchema = z.object({
    name: z
        .string()
        .min(1)
        .max(255)
        .transform((s) => s.trim()),
});
export const userIdParamSchema = z.object({
    id: z.uuid(),
});

// Types aligned with APIResponse convention
export type UserUpdateRequest = z.infer<typeof updateUserSchema>;
export type UserUpdateResponse = APIResponse<AuthUser>;
