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
import { createParser, type EventSourceMessage } from "eventsource-parser";

export interface ChatModelStreamEventData {
    type: "chat_model_stream";
    chunk: string;
}

export interface ChainEndEventData {
    type: "chain_end";
    finalOutput: string;
}

export interface ToolCallEventData {
    type: "tool_call";
    toolName: string;
}

export interface ToolEndEventData {
    type: "tool_end";
    toolName: string;
}

export type StreamEventData =
    | ChatModelStreamEventData
    | ChainEndEventData
    | ToolCallEventData
    | ToolEndEventData;

export async function* sendMessageToBotStream(
    message: string,
    threadId: string
): AsyncGenerator<StreamEventData, void, unknown> {
    const controller = new AbortController();

    const resp = await fetch(getAgentUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
            if (evt.event === undefined && !evt.data) return;
            const event = evt.event || "message";
            const data = evt.data;
            if (!data) return;
            try {
                const payload = JSON.parse(data);
                if (event === "token" && typeof payload.chunk === "string") {
                    pending.push({
                        type: "chat_model_stream",
                        chunk: payload.chunk,
                    });
                } else if (
                    event === "done" &&
                    typeof payload.text === "string"
                ) {
                    pending.push({
                        type: "chain_end",
                        finalOutput: payload.text,
                    });
                } else if (
                    event === "tool_call" &&
                    typeof payload.name === "string"
                ) {
                    pending.push({ type: "tool_call", toolName: payload.name });
                } else if (
                    event === "tool_end" &&
                    typeof payload.name === "string"
                ) {
                    pending.push({ type: "tool_end", toolName: payload.name });
                } else if (event === "error") {
                    throw new Error(payload.message || "Unknown agent error");
                } else {
                    throw new Error(
                        `Unexpected event type: ${event} with data: ${data}`
                    );
                }
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
