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

// GET /history query
export const getHistorySchema = z.object({
    thread_id: z.string().min(1).max(255),
});

export type GetHistoryBodyRequest = z.infer<typeof getHistorySchema>;
export type GetHistoryBodyResponse = {
    messages: ChatMessage[];
};

export type Part = {
    runId?: string;
    isStreaming?: boolean;
} & (
    | {
          type: "text";
          content: string;
      }
    | {
          type: "tool";
          status: "running" | "completed";
          toolName: string;
      }
);

export interface ChatMessage {
    id: string;
    isUser: boolean;
    parts: Part[];
}
