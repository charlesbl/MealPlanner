import { z } from "zod";

// POST /chat body
export const chatMessageSchema = z.object({
    message: z
        .string()
        .min(1)
        .max(4000)
        .transform((s) => s.trim()),
    thread_id: z.string().min(1).max(255).optional(),
});

export type ChatSendBodyRequest = z.infer<typeof chatMessageSchema>;
