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

import {
    streamEventHandler,
    type StreamState,
} from "@/streaming/streamEventHandlers";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { agentExecutor } from "../agents/agentFactory";
import { chatHistoryManager } from "../chat/chatHistoryManager";
import { isApiKeyConfigured } from "../config/llmConfig";

const HISTORY_MAX_LENGTH = 10;

export async function* sendMessageToBotStream(
    message: string
): AsyncGenerator<StreamState, void, unknown> {
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

    let lastState: StreamState = {
        fullResponse: "",
    };

    for await (const event of stream) {
        const handler = eventHandlers.get(event.event);
        if (handler === undefined) {
            yield streamEventHandler.logUnhandledEvent(event, lastState);
            continue;
        }
        lastState = handler(event, lastState);
        yield lastState;
    }

    // Update chat history with the complete response
    if (lastState.fullResponse) {
        chatHistoryManager.addMessage(new AIMessage(lastState.fullResponse));
    }

    // Keep history length manageable
    chatHistoryManager.trimHistory(HISTORY_MAX_LENGTH);
}

const eventHandlers = new Map<
    string,
    (event: any, state: StreamState) => StreamState
>([
    ["on_chat_model_stream", streamEventHandler.handleChatModelStreamEvent],
    ["on_chain_end", streamEventHandler.handleChainEndEvent],
    ["on_tool_start", streamEventHandler.handleToolCallEvent],
    ["on_tool_end", streamEventHandler.handleToolEndEvent],
    ["on_prompt_start", streamEventHandler.handleUselessEvent],
    ["on_prompt_end", streamEventHandler.handleUselessEvent],
    ["on_parser_start", streamEventHandler.handleUselessEvent],
    ["on_parser_end", streamEventHandler.handleUselessEvent],
]);
