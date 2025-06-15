/**
 * LLM Configuration
 *
 * Configures and initializes the ChatOpenAI model with OpenRouter API
 */

import { ChatOpenAI } from "@langchain/openai";

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

if (!OPENROUTER_API_KEY) {
    console.warn(
        "OpenRouter API key not found. Please set VITE_OPENROUTER_API_KEY in your .env file."
    );
}

export const llm = new ChatOpenAI({
    configuration: {
        baseURL: OPENROUTER_BASE_URL,
    },
    apiKey: OPENROUTER_API_KEY,
    // modelName: "google/gemini-2.5-pro-preview",
    modelName: "google/gemini-2.5-flash-preview:thinking",
    // modelName: "meta-llama/llama-4-maverick",
    temperature: 0.7,
});

export function isApiKeyConfigured(): boolean {
    return !!OPENROUTER_API_KEY;
}
