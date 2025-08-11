import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { systemPromptString } from "./prompt.js";

import { getAddMealToWeekTool } from "./tools/addMealToWeekTool.js";
import { getAddOrUpdateMealTool } from "./tools/addOrUpdateMealTool.js";
import { getDeleteMealTool } from "./tools/deleteMealTool.js";
import { getReadMealsTool } from "./tools/readMealsTool.js";
import { getReadWeekSelectionTool } from "./tools/readWeekSelectionTool.js";
import { getRemoveMealFromWeekTool } from "./tools/removeMealFromWeekTool.js";

export function createAgent(llm: ChatOpenAI, token: string) {
    const tools = [
        getReadMealsTool(token),
        getAddOrUpdateMealTool(token),
        getDeleteMealTool(token),
        getAddMealToWeekTool(token),
        getRemoveMealFromWeekTool(token),
        getReadWeekSelectionTool(token),
    ];
    return createReactAgent({
        llm,
        tools,
        checkpointer: new MemorySaver(),
        prompt: systemPromptString,
    });
}
