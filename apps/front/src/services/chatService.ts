/**
 * @fileoverview Chat Service - Streaming chat interface for AI agent interactions
 *
 * Role: Primary service for handling streaming chat conversations with AI agents
 *
 * What it does:
 * - Provides streaming chat API (sendMessageToBotStream) for real-time responses
 * - Orchestrates agent execution with LangChain streaming events
 * - Manages chat history integration and message persistence
 * - Handles stream event processing and chunk yielding
 * - Validates API configuration before processing
 *
 * What it doesn't do:
 * - Create or configure AI agents (delegates to agentFactory)
 * - Implement low-level streaming mechanics (uses streamEventHandlers)
 * - Handle chat history storage/retrieval (uses chatHistoryManager)
 * - Process individual stream events (delegates to event handlers)
 */

// Front now streams from backend agent over SSE
import {
    type StreamEventData,
    streamEventHandler,
} from "@/services/streamEventHandlers";
import { getOrCreateThreadId } from "@/storage/threadStore";

export async function* sendMessageToBotStream(
    message: string
): AsyncGenerator<StreamEventData, void, unknown> {
    const controller = new AbortController();
    const thread_id = getOrCreateThreadId();

    const resp = await fetch(getAgentUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ message, thread_id }),
    });

    if (!resp.ok || !resp.body) {
        throw new Error(`Agent server error: ${resp.status}`);
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finalMessage = "";

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Process SSE lines (support both LF and CRLF)
        while (true) {
            const lf2 = buffer.indexOf("\n\n");
            const crlf2 = buffer.indexOf("\r\n\r\n");
            if (lf2 === -1 && crlf2 === -1) break;
            const boundaryIdx =
                lf2 !== -1 && crlf2 !== -1
                    ? Math.min(lf2, crlf2)
                    : lf2 !== -1
                    ? lf2
                    : crlf2;
            const boundaryLen = boundaryIdx === lf2 ? 2 : 4;
            const packet = buffer.slice(0, boundaryIdx);
            buffer = buffer.slice(boundaryIdx + boundaryLen);
            const lines = packet.split(/\r?\n/);
            let event = "message";
            let data = "";
            for (const line of lines) {
                if (line.startsWith("event:")) event = line.slice(6).trim();
                else if (line.startsWith("data:")) data += line.slice(5).trim();
            }
            if (!data) continue;
            try {
                const payload = JSON.parse(data);
                if (event === "token" && typeof payload.chunk === "string") {
                    finalMessage += payload.chunk;
                    yield streamEventHandler.handleChatModelStreamEvent({
                        event: "on_chat_model_stream",
                        name: "on_chat_model_stream",
                        data: { chunk: { content: payload.chunk } },
                        run_id: "",
                        tags: [],
                        metadata: {},
                        time: new Date(),
                    } as any);
                } else if (
                    event === "done" &&
                    typeof payload.text === "string"
                ) {
                    // Emit as chain_end equivalent for compatibility
                    yield streamEventHandler.handleChainEndEvent({
                        event: "on_chain_end",
                        name: "on_chain_end",
                        data: { output: payload.text },
                        run_id: "",
                        tags: [],
                        metadata: {},
                        time: new Date(),
                    } as any);
                } else if (
                    event === "tool_call" &&
                    typeof payload.name === "string"
                ) {
                    yield streamEventHandler.handleToolCallEvent({
                        event: "on_tool_start",
                        name: payload.name,
                        data: { name: payload.name },
                        run_id: "",
                        tags: [],
                        metadata: {},
                        time: new Date(),
                    } as any);
                } else if (
                    event === "tool_end" &&
                    typeof payload.name === "string"
                ) {
                    yield streamEventHandler.handleToolEndEvent({
                        event: "on_tool_end",
                        name: payload.name,
                        data: { name: payload.name },
                        run_id: "",
                        tags: [],
                        metadata: {},
                        time: new Date(),
                    } as any);
                } else if (event === "error") {
                    throw new Error(payload.message || "Unknown agent error");
                }
            } catch (e) {
                // ignore malformed lines
                console.error("Error parsing SSE data:", e);
            }
        }
    }

    // No local persistence: history is server-side via thread_id
}

function getAgentUrl(): string {
    const base = import.meta.env.VITE_AGENT_URL || "http://localhost:8787";
    return `${base.replace(/\/$/, "")}/chat`;
}
