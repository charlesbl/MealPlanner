/**
 * @fileoverview Stream Event Handlers - Handle different stream event types, process stream chunks
 * Role: Processes streaming events from the language model
 * Does: Handle chat model streams, chain events, tool events, and logging
 * Doesn't: Manage chat state, execute streaming logic, or handle persistence
 */

import type { StreamEvent } from "@langchain/core/tracers/log_stream";

export interface StreamEventData {
    type:
        | "chat_model_stream"
        | "chain_end"
        | "tool_call"
        | "tool_end"
        | "useless_event";
}

export interface ChatModelStreamEventData extends StreamEventData {
    type: "chat_model_stream";
    chunk: string;
}
export interface ChainEndEventData extends StreamEventData {
    type: "chain_end";
    finalOutput: string;
}
export interface ToolCallEventData extends StreamEventData {
    type: "tool_call";
    toolName: string;
}
export interface ToolEndEventData extends StreamEventData {
    type: "tool_end";
    toolName: string;
}
export interface UselessEventData extends StreamEventData {
    type: "useless_event";
}

export class StreamEventHandlerImpl {
    handleChatModelStreamEvent(
        event: StreamEvent
    ): ChatModelStreamEventData | UselessEventData {
        if (event.data?.chunk?.content) {
            const chunk = event.data.chunk.content;
            if (typeof chunk === "string" && chunk.length > 0) {
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
        if (event.name === "AgentExecutor" && event.data?.output) {
            const finalOutput = event.data.output;
            if (typeof finalOutput === "string") {
                return {
                    type: "chain_end",
                    finalOutput: finalOutput,
                };
            }
        }
        return {
            type: "useless_event",
        };
    }
    handleToolCallEvent(
        event: StreamEvent
    ): ToolCallEventData | UselessEventData {
        return {
            type: "tool_call",
            toolName: event.name,
        };
    }
    handleToolEndEvent(
        event: StreamEvent
    ): ToolEndEventData | UselessEventData {
        return {
            type: "tool_end",
            toolName: event.name,
        };
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
