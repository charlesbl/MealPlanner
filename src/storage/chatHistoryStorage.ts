/**
 * @fileoverview Chat History Storage - Load/save chat history to localStorage, serialize/deserialize messages
 * Role: Handles persistent storage of chat history
 * Does: Serialize and store chat messages to localStorage, load and deserialize messages
 * Doesn't: Manage active chat state or provide business logic operations
 */

import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";

const LOCAL_STORAGE_KEY = "mealPlannerChatHistory";

export interface StoredMessage {
    type: string;
    content: string;
}

export function loadChatHistory(): BaseMessage[] {
    const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedHistory) {
        try {
            const parsedHistory: StoredMessage[] = JSON.parse(storedHistory);
            // Reconstruct BaseMessage instances
            return parsedHistory.map((msg) => {
                if (msg.type === "human") {
                    return new HumanMessage(msg.content);
                } else if (msg.type === "ai") {
                    return new AIMessage(msg.content);
                }
                // Handle other types if necessary, or default to a generic message
                console.warn(
                    `Unknown message type found in stored history: ${msg.type}`
                );
                // Return a default or skip; returning AIMessage as a fallback
                return new AIMessage(msg.content);
            });
        } catch (error) {
            console.error(
                "Error parsing chat history from local storage:",
                error
            );
            localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted data
            return []; // Start fresh if parsing fails
        }
    }
    return []; // No history found
}

export function saveChatHistory(history: BaseMessage[]): void {
    try {
        // Store a simplified version for reliable serialization
        const simplifiedHistory: StoredMessage[] = history.map((msg) => ({
            type: msg instanceof HumanMessage ? "human" : "ai",
            content:
                typeof msg.content === "string"
                    ? msg.content
                    : JSON.stringify(msg.content),
        }));
        localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify(simplifiedHistory)
        );
    } catch (error) {
        console.error("Error saving chat history to local storage:", error);
    }
}

export function clearStoredChatHistory(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
}
