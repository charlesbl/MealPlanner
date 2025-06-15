/**
 * agentFactory.ts - LangChain Agent Configuration
 *
 * Assembles and exports a configured LangChain AgentExecutor that combines:
 * - A language model (LLM) with tool-calling capabilities
 * - Meal management tools (create, read, update, delete, search)
 * - System prompts for meal planning conversations
 * - Chat history and conversation flow management
 *
 * This factory creates the core AI agent that powers the meal planner's
 * conversational interface. It handles tool selection and execution but
 * does NOT manage chat state, UI interactions, or data persistence -
 * those responsibilities belong to the chat service and storage layers.
 */

import { llm } from "@/config/llmConfig";
import { AddOrUpdateMealTool } from "@/services/tools/addOrUpdateMealTool";
import { DeleteMealTool } from "@/services/tools/deleteMealTool";
import { ReadMealsTool } from "@/services/tools/readMealsTool";
import { SearchMealsByDateTool } from "@/services/tools/searchMealsByDateTool";
import { SetDateRangeFilterTool } from "@/services/tools/setDateRangeFilterTool";
import { SetMealTypeFilterTool } from "@/services/tools/setMealTypeFilterTool";
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
    ReadMealsTool,
    AddOrUpdateMealTool,
    DeleteMealTool,
    SearchMealsByDateTool,
    SetDateRangeFilterTool,
    SetMealTypeFilterTool,
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
