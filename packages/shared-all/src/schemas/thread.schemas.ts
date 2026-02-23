import { z } from "zod";
import type { APIResponsePayload } from "./common.schemas.js";

export const threadSchema = z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    createdAt: z.coerce.date(),
    lastMessageAt: z.coerce.date(),
});
export type Thread = z.infer<typeof threadSchema>;

export const threadSummarySchema = threadSchema.pick({
    id: true,
    title: true,
    lastMessageAt: true,
});
export type ThreadSummary = z.infer<typeof threadSummarySchema>;
export type ListThreadsResponse = APIResponsePayload<ThreadSummary[]>;
