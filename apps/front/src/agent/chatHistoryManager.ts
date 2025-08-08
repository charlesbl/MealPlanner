/**
 * @fileoverview Chat History Manager - Manage in-memory chat history, provide history operations
 * Role: Manages active chat history state and operations
 * Does: Maintain current chat session, add/remove messages, trim history, provide history access
 * Doesn't: Handle storage persistence or streaming logic
 */

import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import {
    clearStoredChatHistory,
    loadChatHistory,
    saveChatHistory,
} from "../storage/chatHistoryStorage";

class ChatHistoryManager {
    private chatHistory: BaseMessage[] = [];

    constructor() {
        this.chatHistory = loadChatHistory();
    }

    getChatHistory(): BaseMessage[] {
        return [...this.chatHistory];
    }

    addMessage(message: BaseMessage): void {
        this.chatHistory.push(message);
        this.saveHistory();
    }

    addMessages(userMessage: string, aiResponse: string): void {
        this.chatHistory.push(new HumanMessage(userMessage));
        this.chatHistory.push(new AIMessage(aiResponse));
        this.saveHistory();
    }

    trimHistory(maxLength: number = 10): void {
        if (this.chatHistory.length > maxLength) {
            this.chatHistory = this.chatHistory.slice(-maxLength);
            this.saveHistory();
        }
    }

    clearHistory(): void {
        this.chatHistory = [];
        clearStoredChatHistory();
    }

    private saveHistory(): void {
        saveChatHistory(this.chatHistory);
    }

    getHistoryExcludingLast(): BaseMessage[] {
        return this.chatHistory.slice(0, -1);
    }
}

export const chatHistoryManager = new ChatHistoryManager();
