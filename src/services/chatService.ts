import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { StructuredTool } from "@langchain/core/tools";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { AIMessage, HumanMessage, BaseMessage } from "@langchain/core/messages";
import { z } from 'zod';
import { ReadMealsTool } from './tools/readMealsTool';
import { AddOrUpdateMealTool } from './tools/addOrUpdateMealTool';
import { DeleteMealTool } from './tools/deleteMealTool';
import { systemPromptString } from './prompt'; 

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

if (!OPENROUTER_API_KEY) {
  console.warn("OpenRouter API key not found. Please set VITE_OPENROUTER_API_KEY in your .env file.");
}

const tools: StructuredTool[] = [
    ReadMealsTool,
    AddOrUpdateMealTool,
    DeleteMealTool
];

// --- Initialize LLM ---
const llm = new ChatOpenAI({
  configuration: {
    baseURL: OPENROUTER_BASE_URL,
  },
  apiKey: OPENROUTER_API_KEY,
  // modelName: "google/gemini-2.5-pro-preview", 
  modelName: "google/gemini-2.5-flash-preview:thinking",
  temperature: 0.7,
});

// --- Bind Tools to LLM ---
// Use bind_tools to format for the 'tools' parameter standard
const llmWithTools = llm.bindTools(tools);

// --- Define Agent Prompt ---
const fullAgentPrompt = ChatPromptTemplate.fromMessages([
  ["system", systemPromptString], // Use the imported string directly
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
  new MessagesPlaceholder("agent_scratchpad"),
]);

// --- Create Agent and Executor ---
// Use await and pass the LLM with tools bound
const agent = createToolCallingAgent({
  llm: llmWithTools,
  prompt: fullAgentPrompt, // Use the reconstructed prompt
  tools,
})

// Ensure the agent type is compatible with AgentExecutor
const agentExecutor = new AgentExecutor({
  agent,
  tools,
  verbose: true,
});

// --- Chat History Management ---
const LOCAL_STORAGE_KEY = 'mealPlannerChatHistory';

// Function to load history from local storage
function loadChatHistory(): BaseMessage[] {
  const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storedHistory) {
    try {
      const parsedHistory: { type: string; content: string }[] = JSON.parse(storedHistory);
      // Reconstruct BaseMessage instances
      return parsedHistory.map(msg => {
        if (msg.type === 'human') {
          return new HumanMessage(msg.content);
        } else if (msg.type === 'ai') {
          return new AIMessage(msg.content);
        }
        // Handle other types if necessary, or default to a generic message
        // For simplicity, we'll assume only human and ai messages for now
        console.warn(`Unknown message type found in stored history: ${msg.type}`);
        // Return a default or skip; returning AIMessage as a fallback
        return new AIMessage(msg.content);
      });
    } catch (error) {
      console.error("Error parsing chat history from local storage:", error);
      localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted data
      return []; // Start fresh if parsing fails
    }
  }
  return []; // No history found
}

// Function to save history to local storage
function saveChatHistory(history: BaseMessage[]): void {
  try {
    // Store a simplified version for reliable serialization
    const simplifiedHistory = history.map(msg => ({
      type: msg instanceof HumanMessage ? 'human' : 'ai', // Add more types if needed
      content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content), // Ensure content is string
    }));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(simplifiedHistory));
  } catch (error) {
    console.error("Error saving chat history to local storage:", error);
    // Handle potential storage quota errors etc.
  }
}

// Initialize chat history by loading from storage
let chatHistory: BaseMessage[] = loadChatHistory();

// Function to get the current chat history
export function getChatHistory(): BaseMessage[] {
  return [...chatHistory]; // Return a copy to prevent direct modification
}

// --- Exported Function ---
export async function sendMessageToBot(message: string): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    return "Error: OpenRouter API key not configured.";
  }
  try {
    // Use the current chatHistory
    const response = await agentExecutor.invoke({
        input: message,
        chat_history: chatHistory,
    });

    // Update chat history
    chatHistory.push(new HumanMessage(message));
    const outputMessage = typeof response.output === 'string' ? response.output : JSON.stringify(response.output);
    chatHistory.push(new AIMessage(outputMessage));

    // Keep history length manageable
    const maxHistoryLength = 10; // Or adjust as needed
    if (chatHistory.length > maxHistoryLength) {
        chatHistory = chatHistory.slice(-maxHistoryLength);
    }

    // Save the updated history
    saveChatHistory(chatHistory);

    return outputMessage;
  } catch (error) {
    console.error("Error communicating with chatbot agent:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (error instanceof z.ZodError) {
        return `There was an issue with the information provided: ${error.errors.map(e => `${e.path.join('.')} - ${e.message}`).join(', ')}. Please try again.`;
    }
    // Check for the specific OpenRouter error message
    if (errorMessage.includes('"functions" and "function_call" are deprecated')) {
        return "Error: The connection to the AI service failed due to outdated parameters. Please try again later or contact support if the issue persists.";
    }
    return `Sorry, I encountered an error processing your request: ${errorMessage}. Please check the console for details and try again.`;
  }
}

// Optional: Add a function to clear history if needed
export function clearChatHistory(): void {
    chatHistory = [];
    localStorage.removeItem(LOCAL_STORAGE_KEY);
}
