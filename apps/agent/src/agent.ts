import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { systemPromptString } from "./prompt.js";
import { AddMealToWeekTool } from "./tools/addMealToWeekTool.js";
import { AddOrUpdateMealTool } from "./tools/addOrUpdateMealTool.js";
import { DeleteMealTool } from "./tools/deleteMealTool.js";
import { ReadMealsTool } from "./tools/readMealsTool.js";
import { ReadWeekSelectionTool } from "./tools/readWeekSelectionTool.js";
import { RemoveMealFromWeekTool } from "./tools/removeMealFromWeekTool.js";

const tools = [
    ReadMealsTool,
    AddOrUpdateMealTool,
    DeleteMealTool,
    AddMealToWeekTool,
    RemoveMealFromWeekTool,
    ReadWeekSelectionTool,
];

export function createAgent(llm: ChatOpenAI) {
    return createReactAgent({
        llm,
        tools,
        checkpointer: new MemorySaver(),
        prompt: systemPromptString,
    });
}
