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

import { agentExecutor } from "@/agent/agentFactory";
import {
    streamEventHandler,
    type ChainEndEventData,
    type StreamEventData,
} from "@/services/streamEventHandlers";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import type { StreamEvent } from "@langchain/core/tracers/log_stream";
import { chatHistoryManager } from "../agent/chatHistoryManager";
import { isApiKeyConfigured } from "../config/llmConfig";

const HISTORY_MAX_LENGTH = 10;

export async function* sendMessageToBotStream(
    message: string
): AsyncGenerator<StreamEventData, void, unknown> {
    if (!isApiKeyConfigured()) {
        throw new Error(
            "OpenRouter API key is not configured. Please set VITE_OPENROUTER_API_KEY in your .env file."
        );
    }

    chatHistoryManager.addMessage(new HumanMessage(message));

    const stream = await agentExecutor.streamEvents(
        {
            input: message,
            chat_history: chatHistoryManager.getHistoryExcludingLast(),
        },
        { version: "v2" }
    );
    let lastMessage = "";

    for await (const event of stream) {
        const handler = eventHandlers.get(event.event);
        if (handler === undefined) {
            yield streamEventHandler.logUnhandledEvent(event);
            continue;
        }
        const eventData = handler(event);
        if (eventData.type === "chain_end") {
            lastMessage = (eventData as ChainEndEventData).finalOutput;
        }
        yield eventData;
    }

    // Update chat history with the complete response
    if (lastMessage.trim().length > 0) {
        chatHistoryManager.addMessage(new AIMessage(lastMessage));
    }

    // Keep history length manageable
    chatHistoryManager.trimHistory(HISTORY_MAX_LENGTH);
}

const eventHandlers = new Map<string, (event: StreamEvent) => StreamEventData>([
    ["on_chat_model_start", streamEventHandler.handleUselessEvent],
    ["on_chat_model_stream", streamEventHandler.handleChatModelStreamEvent],
    ["on_chat_model_end", streamEventHandler.handleUselessEvent],

    ["on_chain_start", streamEventHandler.handleUselessEvent],
    ["on_chain_stream", streamEventHandler.handleUselessEvent],
    ["on_chain_end", streamEventHandler.handleChainEndEvent],

    ["on_tool_start", streamEventHandler.handleToolCallEvent],
    ["on_tool_end", streamEventHandler.handleToolEndEvent],

    ["on_prompt_start", streamEventHandler.handleUselessEvent],
    ["on_prompt_end", streamEventHandler.handleUselessEvent],

    ["on_parser_start", streamEventHandler.handleUselessEvent],
    ["on_parser_end", streamEventHandler.handleUselessEvent],
]);
