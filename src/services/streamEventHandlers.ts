/**
 * @fileoverview Stream Event Handlers - Handle different stream event types, process stream chunks
 * Role: Processes streaming events from the language model
 * Does: Handle chat model streams, chain events, tool events, and logging
 * Doesn't: Manage chat state, execute streaming logic, or handle persistence
 */

import type { StreamEvent } from "@langchain/core/tracers/log_stream";

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

export interface UselessEventData {
    type: "useless_event";
}

export type StreamEventData =
    | ChatModelStreamEventData
    | ChainEndEventData
    | ToolCallEventData
    | ToolEndEventData
    | UselessEventData;

export class StreamEventHandlerImpl {
    private extractTextContent(content: unknown): string {
        if (typeof content === "string") return content;
        if (Array.isArray(content)) {
            // Try to pull text from array content parts
            return content
                .map((part: any) => {
                    if (typeof part === "string") return part;
                    if (part && typeof part.text === "string") return part.text;
                    if (part && typeof part.content === "string")
                        return part.content;
                    if (
                        part &&
                        typeof part?.type === "string" &&
                        typeof part?.value === "string"
                    )
                        return part.value;
                    return "";
                })
                .join("");
        }
        // Best-effort fallback
        try {
            return JSON.stringify(content);
        } catch {
            return "";
        }
    }
    handleChatModelStreamEvent(
        event: StreamEvent
    ): ChatModelStreamEventData | UselessEventData {
        if (event.data?.chunk?.content !== undefined) {
            const chunk = this.extractTextContent(event.data.chunk.content);
            if (chunk.length > 0) {
                return {
                    type: "chat_model_stream",
                    chunk,
                };
            }
        }
        return {
            type: "useless_event",
        };
    }

    handleChainEndEvent(
        event: StreamEvent
    ): ChainEndEventData | UselessEventData {
        // Accept legacy AgentExecutor or LangGraph graph end/state outputs
        const output = (event as any)?.data?.output;
        if (output !== undefined) {
            if (typeof output === "string") {
                return { type: "chain_end", finalOutput: output };
            }
            // LangGraph often returns state with messages array
            const maybeMessages = (output as any)?.messages;
            if (Array.isArray(maybeMessages) && maybeMessages.length > 0) {
                const last = maybeMessages[maybeMessages.length - 1];
                const content = this.extractTextContent(last?.content);
                if (content.length > 0) {
                    return { type: "chain_end", finalOutput: content };
                }
            }
        }
        return {
            type: "useless_event",
        };
    }
    handleToolCallEvent(
        event: StreamEvent
    ): ToolCallEventData | UselessEventData {
        const toolName = (event as any)?.data?.name || event.name;
        return { type: "tool_call", toolName };
    }
    handleToolEndEvent(
        event: StreamEvent
    ): ToolEndEventData | UselessEventData {
        const toolName = (event as any)?.data?.name || event.name;
        return { type: "tool_end", toolName };
    }

    handleUselessEvent(event: StreamEvent): UselessEventData {
        console.debug(`Useless event started: ${event.name}`, event.data);
        return {
            type: "useless_event",
        };
    }

    logUnhandledEvent(event: StreamEvent): UselessEventData {
        console.error(`Unhandled stream event: ${event.event}`, {
            name: event.name,
            runId: event.run_id,
            tags: event.tags,
            metadata: event.metadata,
            data: event.data,
        });
        return {
            type: "useless_event",
        };
    }
}

export const streamEventHandler = new StreamEventHandlerImpl();
