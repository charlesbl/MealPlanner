/**
 * Role: Front-end chat streaming service.
 *
 * Purpose:
 * - Gateway between the UI and the agent backend to send a user message
 *   and receive a stream of events (SSE).
 *
 * In scope (what this module does):
 * - Exposes sendMessageToBotStream(message, threadId) => AsyncGenerator of typed events
 * - Includes provided threadId in requests
 * - Resolves backend URL via VITE_AGENT_URL (fallback http://localhost:8787)
 *
 * Out of scope (what this module must not do):
 * - Agent configuration/management
 * - History storage/persistence
 * - UI state or rendering
 * - Business logic or retry strategies
 *
 * Minimal contract:
 * - Input: message (string)
 * - Output: stream of backend events (tokens, chain end, tool calls, etc.)
 */
import type { StreamEventData } from "@mealplanner/shared-all";
import { createParser, type EventSourceMessage } from "eventsource-parser";
import { authService } from "./authService";

async function* sendMessageToBotStream(
    message: string,
    threadId: string
): AsyncGenerator<StreamEventData, void, unknown> {
    const controller = new AbortController();

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    const token = authService.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const resp = await fetch(getAgentUrl(), {
        method: "POST",
        headers,
        signal: controller.signal,
        body: JSON.stringify({ message, thread_id: threadId }),
    });

    if (!resp.ok || !resp.body) {
        throw new Error(`Agent server error: ${resp.status}`);
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();

    // Buffer parsed SSE events so we can yield them from the generator safely
    const pending: StreamEventData[] = [];

    const parser = createParser({
        onEvent: (evt: EventSourceMessage) => {
            if (evt.data === undefined)
                throw new Error("Event data is undefined");
            try {
                const parsedEvent = JSON.parse(evt.data) as StreamEventData;
                pending.push(parsedEvent);
            } catch (e) {
                console.error("Error parsing SSE data:", e);
            }
        },
    });

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        parser.feed(chunk);
        // Flush pending events gathered by the parser for this chunk
        while (pending.length) {
            const evt = pending.shift()!;
            yield evt;
        }
    }

    // Flush any trailing data as a final message if the stream ended mid-line
    parser.reset({ consume: true });
    while (pending.length) {
        const evt = pending.shift()!;
        yield evt;
    }
}

function getAgentUrl(): string {
    const base = import.meta.env.VITE_AGENT_URL || "http://localhost:8787";
    return `${base.replace(/\/$/, "")}/chat`;
}

export const chatService = {
    sendMessageToBotStream,
};
