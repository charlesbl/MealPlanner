/**
 * agentFactory.ts - LangGraph Agent Configuration
 *
 * Assembles and exports a configured LangGraph prebuilt ReAct agent that combines:
 * - A language model (LLM) with tool-calling capabilities
 * - Meal deck and week management tools (create, read, update, delete)
 * - Conversation flow managed by LangGraph runtime
 *
 * This factory creates the core AI agent that powers the meal planner's
 * conversational interface with deck-based meal management.
 */

import { systemPromptString } from "@/agent/prompt";
import { AddMealToWeekTool } from "@/agent/tools/addMealToWeekTool";
import { AddOrUpdateMealTool } from "@/agent/tools/addOrUpdateMealTool";
import { DeleteMealTool } from "@/agent/tools/deleteMealTool";
import { ReadMealsTool } from "@/agent/tools/readMealsTool";
import { ReadWeekSelectionTool } from "@/agent/tools/readWeekSelectionTool";
import { RemoveMealFromWeekTool } from "@/agent/tools/removeMealFromWeekTool";
import { llm } from "@/config/llmConfig";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

const tools = [
    // Core meal management
    ReadMealsTool,
    AddOrUpdateMealTool,
    DeleteMealTool,

    // Week selection management
    AddMealToWeekTool,
    RemoveMealFromWeekTool,
    ReadWeekSelectionTool,
];

export const reactAgent = createReactAgent({
    llm,
    tools,
    // Use LangGraph's built-in checkpointer to enable thread-based memory
    // so we don't have to manually pass historical messages on each call.
    checkpointer: new MemorySaver(),
    // Inject a stable system prompt at the graph level (best practice)
    prompt: systemPromptString,
});
