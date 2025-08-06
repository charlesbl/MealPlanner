/**
 * agentFactory.ts - LangChain Agent Configuration
 *
 * Assembles and exports a configured LangChain AgentExecutor that combines:
 * - A language model (LLM) with tool-calling capabilities
 * - Meal deck and week management tools (create, read, update, delete)
 * - System prompts for meal planning conversations
 * - Chat history and conversation flow management
 *
 * This factory creates the core AI agent that powers the meal planner's
 * conversational interface with deck-based meal management.
 */

import { AddMealToWeekTool } from "@/agent/tools/addMealToWeekTool";
import { AddOrUpdateMealTool } from "@/agent/tools/addOrUpdateMealTool";
import { DeleteMealTool } from "@/agent/tools/deleteMealTool";
import { ReadMealsTool } from "@/agent/tools/readMealsTool";
import { ReadWeekSelectionTool } from "@/agent/tools/readWeekSelectionTool";
import { RemoveMealFromWeekTool } from "@/agent/tools/removeMealFromWeekTool";
import { llm } from "@/config/llmConfig";
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from "@langchain/core/prompts";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import type { StructuredTool } from "langchain/tools";
import { systemPromptString } from "./prompt";

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
    ReadWeekSelectionTool,
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
