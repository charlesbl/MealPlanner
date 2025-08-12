// import { MemorySaver } from "@langchain/langgraph"; // conservé en commentaire pour référence
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { systemPromptString } from "./prompt.js";
import { ApiCheckpointSaver } from "./checkpoint/ApiCheckpointSaver.js";

export function createAgent(
    llm: ChatOpenAI,
    tools: Parameters<typeof createReactAgent>[0]["tools"]
) {
    // Utilisation d'un checkpointer custom qui sera ensuite branché sur l'API
    const checkpointer = new ApiCheckpointSaver();
    return createReactAgent({
        llm,
        tools,
        checkpointer,
        prompt: systemPromptString,
    });
}
