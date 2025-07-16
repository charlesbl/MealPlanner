/**
 * agentFactory.ts - LangChain Agent Configuration
 *
 * Assembles and exports a configured LangChain AgentExecutor that combines:
 * - A language model (LLM) with tool-calling capabilities
 * - Meal deck and week management tools (create, read, update, delete)
 * - Widget display tools for chat-first interface
 * - System prompts for meal planning conversations
 * - Chat history and conversation flow management
 *
 * This factory creates the core AI agent that powers the meal planner's
 * conversational interface with deck-based meal management.
 */

import { llm } from "@/config/llmConfig";
import { AddOrUpdateMealTool } from "@/services/tools/addOrUpdateMealTool";
import { DeleteMealTool } from "@/services/tools/deleteMealTool";
import { ReadMealsTool } from "@/services/tools/readMealsTool";
import { ShowWidgetTool } from "@/services/tools/showWidgetTool";
import { AddMealToWeekTool } from "@/services/tools/addMealToWeekTool";
import { RemoveMealFromWeekTool } from "@/services/tools/removeMealFromWeekTool";
import { GenerateWeekSelectionTool } from "@/services/tools/generateWeekSelectionTool";
import { ReadWeekSelectionTool } from "@/services/tools/readWeekSelectionTool";
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from "@langchain/core/prompts";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import type { StructuredTool } from "langchain/tools";
import { systemPromptString } from "../services/prompt";

const fullAgentPrompt = ChatPromptTemplate.fromMessages([
    ["system", systemPromptString],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
]);

const tools: StructuredTool[] = [
    // Core meal management
    ReadMealsTool,
    AddOrUpdateMealTool,
    DeleteMealTool,
    
    // Week selection management
    AddMealToWeekTool,
    RemoveMealFromWeekTool,
    GenerateWeekSelectionTool,
    ReadWeekSelectionTool,
    
    // UI widgets
    ShowWidgetTool,
];

const llmWithTools = llm.bindTools(tools);

const agent = createToolCallingAgent({
    llm: llmWithTools,
    prompt: fullAgentPrompt,
    tools,
});

export const agentExecutor = new AgentExecutor({
    agent,
    tools,
    verbose: false,
});
