// import { MemorySaver } from "@langchain/langgraph"; // conservé en commentaire pour référence
import { BaseCheckpointSaver } from "@langchain/langgraph-checkpoint";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { Pool } from "pg";
import { systemPromptString } from "./prompt.js";

export async function createCheckpointer() {
    if (typeof process.env.DB_URL !== "string") {
        throw new Error("DB_URL environment variable is not set");
    }

    const pool = new Pool({
        connectionString: process.env.DB_URL,
    });

    const checkpointer = new PostgresSaver(pool);
    await checkpointer.setup();
    return checkpointer;
}

export function createAgent(
    llm: ChatOpenAI,
    tools: Parameters<typeof createReactAgent>[0]["tools"],
    checkpointer: BaseCheckpointSaver,
) {
    return createReactAgent({
        llm,
        tools,
        checkpointer,
        prompt: systemPromptString,
    });
}
