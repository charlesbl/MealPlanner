import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
// Import StructuredTool
import { StructuredTool } from "@langchain/core/tools";
import type { Tool } from "@langchain/core/tools";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
// Correctly import message types
import { AIMessage, HumanMessage, BaseMessage, SystemMessage } from "@langchain/core/messages";
import { z } from 'zod';
import { Runnable } from "@langchain/core/runnables"; // Import Runnable

// Import meal store functions
import { useMealStore, MealSlot } from '@/stores/mealStore'; // MealSlot is imported here
import type { MealsState } from '@/stores/mealStore';

// --- Environment Variable Setup ---
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

if (!OPENROUTER_API_KEY) {
  console.warn("OpenRouter API key not found. Please set VITE_OPENROUTER_API_KEY in your .env file.");
}

// --- Define Tool Schemas with Zod ---
const readMealsSchema = z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "startDate must be in YYYY-MM-DD format").describe("The start date of the period (YYYY-MM-DD)"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "endDate must be in YYYY-MM-DD format").describe("The end date of the period (YYYY-MM-DD)"),
});

const addOrUpdateMealSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format").describe("The date for the meal (YYYY-MM-DD)"),
    slot: z.nativeEnum(MealSlot).describe(`The meal slot (${Object.values(MealSlot).join(' | ')})`),
    mealName: z.string().min(1, "mealName cannot be empty").describe("The name of the meal to add or update"),
});

const deleteMealSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format").describe("The date of the meal to delete (YYYY-MM-DD)"),
    slot: z.nativeEnum(MealSlot).describe(`The meal slot to delete (${Object.values(MealSlot).join(' | ')})`),
});


// --- Define Tools using StructuredTool ---
class ReadMealsTool extends StructuredTool<typeof readMealsSchema> {
  name = "read_meals_for_period";
  description = "Reads all meals planned between a start date and an end date. Dates must be in YYYY-MM-DD format.";
  schema = readMealsSchema;

  async _call(input: z.infer<typeof readMealsSchema>): Promise<string> {
    const mealStore = useMealStore();
    try {
      const meals: MealsState = mealStore.getMealsForPeriod(input.startDate, input.endDate);
      const mealCount = Object.keys(meals).reduce((count, date) => count + Object.keys(meals[date]).length, 0);
      if (mealCount === 0) {
          return "No meals found for this period.";
      }
      // Format output for better readability
      let output = "Meals found:\n";
      Object.entries(meals).forEach(([date, dayMeals]) => {
          output += `${date}:\n`;
          Object.entries(dayMeals).forEach(([slot, name]) => {
              output += `  - ${slot}: ${name}\n`;
          });
      });
      return output;
    } catch (error: any) {
      console.error("Error in readMealsTool:", error);
      return `Error reading meals: ${error.message}`;
    }
  }
}

class AddOrUpdateMealTool extends StructuredTool<typeof addOrUpdateMealSchema> {
  name = "add_or_update_meal";
  description = `Adds a new meal or updates an existing meal for a specific date and meal slot. Valid slots are: ${Object.values(MealSlot).join(', ')}. Date must be in YYYY-MM-DD format.`;
  schema = addOrUpdateMealSchema;

  async _call(input: z.infer<typeof addOrUpdateMealSchema>): Promise<string> {
    const mealStore = useMealStore();
    try {
      mealStore.setMeal(input.date, input.slot, input.mealName);
      return `Successfully set '${input.mealName}' for ${input.slot} on ${input.date}.`;
    } catch (error: any) {
      console.error("Error in addOrUpdateMealTool:", error);
      return `Error setting meal: ${error.message}`;
    }
  }
}

class DeleteMealTool extends StructuredTool<typeof deleteMealSchema> {
  name = "delete_meal";
  description = `Deletes a meal for a specific date and meal slot. Valid slots are: ${Object.values(MealSlot).join(', ')}. Date must be in YYYY-MM-DD format.`;
  schema = deleteMealSchema;

  async _call(input: z.infer<typeof deleteMealSchema>): Promise<string> {
    const mealStore = useMealStore();
    try {
      mealStore.setMeal(input.date, input.slot, ''); // Use setMeal with empty string to delete
      return `Successfully deleted meal for ${input.slot} on ${input.date}.`;
    } catch (error: any) {
      console.error("Error in deleteMealTool:", error);
      return `Error deleting meal: ${error.message}`;
    }
  }
}

// Instantiate the tools
const tools: StructuredTool[] = [
    new ReadMealsTool(),
    new AddOrUpdateMealTool(),
    new DeleteMealTool()
];

// --- Initialize LLM ---
const llm = new ChatOpenAI({
  configuration: {
    baseURL: OPENROUTER_BASE_URL,
  },
  apiKey: OPENROUTER_API_KEY,
  modelName: "openai/gpt-4o", // Or another model supporting tool calls
  temperature: 0.7,
});

// --- Bind Tools to LLM ---
// Use bind_tools to format for the 'tools' parameter standard
const llmWithTools = llm.bindTools(tools);

// --- Define Agent Prompt ---
// Get MealSlot values dynamically
const mealSlotValues = Object.values(MealSlot).join(', ');

const prompt = ChatPromptTemplate.fromMessages([
  // Update the system prompt to include MealSlot values
  ["system", `You are a helpful assistant for a meal planning application. You have access to tools to manage meals (read, add/update, delete).
Available meal slots are: ${mealSlotValues}.
Always use YYYY-MM-DD format for dates. Today's date is ${new Date().toISOString().split('T')[0]}.
Respond directly to the user after using a tool. If a date is ambiguous (e.g., "next Tuesday"), ask for clarification in YYYY-MM-DD format.`],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
  new MessagesPlaceholder("agent_scratchpad"),
]);

// --- Create Agent and Executor ---
// Use await and pass the LLM with tools bound
const agent = createToolCallingAgent({
  llm: llmWithTools,
  prompt,
  tools,
})

// Ensure the agent type is compatible with AgentExecutor
const agentExecutor = new AgentExecutor({
  agent: agent as Runnable<any, any>, // Cast agent if necessary, depending on Langchain version/types
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
    console.log("Chat history cleared.");
}
