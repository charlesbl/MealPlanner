import { z } from "zod";

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
