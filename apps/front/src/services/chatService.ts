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

import { reactAgent } from "@/agent/agentFactory";
// System prompt is now injected via agent stateModifier in agentFactory
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

    // Persist user's message locally for UI continuity (optional, since LangGraph persists via checkpointer)
    chatHistoryManager.addMessage(new HumanMessage(message));

    // Without a browser-safe checkpointer, pass full conversation history for continuity.
    const stream = await reactAgent.streamEvents(
        { messages: chatHistoryManager.getChatHistory() },
        { version: "v2" }
    );
    let lastMessage = ""; // accumulate final assistant response from token stream

    for await (const event of stream) {
        console.log("Received stream event:", event);
        const handler = eventHandlers.get(event.event);
        if (handler === undefined) {
            yield streamEventHandler.logUnhandledEvent(event);
            continue;
        }
        const eventData = handler(event);
        // Accumulate final output from streaming tokens. Reset on tool calls to avoid
        // capturing intermediate reasoning/tool-selection content.
        if (eventData.type === "tool_call") {
            lastMessage = "";
        } else if (eventData.type === "chat_model_stream") {
            lastMessage += eventData.chunk;
        } else if (eventData.type === "chain_end") {
            // Fallback for legacy AgentExecutor; keep for compatibility
            lastMessage = (eventData as ChainEndEventData).finalOutput;
        }
        yield eventData;
    }

    // Update local chat history with the complete response (UI persistence)
    if (lastMessage.trim().length > 0) {
        chatHistoryManager.addMessage(new AIMessage(lastMessage));
    }

    // Keep history length manageable
    chatHistoryManager.trimHistory(HISTORY_MAX_LENGTH);
}

const eventHandlers = new Map<string, (event: StreamEvent) => StreamEventData>([
    // LangGraph graph-level events
    [
        "on_graph_end",
        streamEventHandler.handleChainEndEvent.bind(streamEventHandler),
    ],

    // Chat model token stream
    [
        "on_chat_model_stream",
        streamEventHandler.handleChatModelStreamEvent.bind(streamEventHandler),
    ],

    // Chain-level (legacy/compat)
    [
        "on_chain_end",
        streamEventHandler.handleChainEndEvent.bind(streamEventHandler),
    ],

    // Tool calls
    [
        "on_tool_start",
        streamEventHandler.handleToolCallEvent.bind(streamEventHandler),
    ],
    [
        "on_tool_end",
        streamEventHandler.handleToolEndEvent.bind(streamEventHandler),
    ],
]);
