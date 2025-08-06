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
    modelName: "z-ai/glm-4.5",
    // modelName: "google/gemini-2.5-pro-preview",
    // modelName: "google/gemini-2.5-flash",
    // modelName: "meta-llama/llama-4-maverick",
    temperature: 0.7,
    maxTokens: 16384,
    modelKwargs: {
        provider: {
            order: ["chutes/fp8", "z-ai/fp8"],
            allow_fallbacks: false,
        },
    },
});

export function isApiKeyConfigured(): boolean {
    return !!OPENROUTER_API_KEY;
}
