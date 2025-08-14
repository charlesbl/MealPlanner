import { HumanMessage } from "@langchain/core/messages";
import type { StreamEvent } from "@langchain/core/tracers/log_stream";
import { ChatOpenAI } from "@langchain/openai";
import { StreamEventData } from "@mealplanner/shared-all";
import { AuthRequest, requireAuth } from "@mealplanner/shared-back";
import cors from "cors";
import { config } from "dotenv";
import express, { Response } from "express";
import { ZodObject } from "zod";
import { createAgent } from "./agent.js";
import { getAddMealTool } from "./tools/addMealTool.js";
import { getAddOrUpdateRecipeTool } from "./tools/addOrUpdateRecipeTool.js";
import { getReadLibraryTool } from "./tools/readLibraryTool.js";
import { getReadPlanTool } from "./tools/readPlanTool.js";
import { getRemoveRecipeFromPlanTool } from "./tools/removeMealTool.js";
import { getDeleteRecipeTool } from "./tools/removeRecipeTool.js";
import { AgentTool } from "./tools/types.js";

//dotenv
config();

// Simple, minimal SSE agent server that streams assistant output

const app = express();
app.use(cors());
app.use(express.json());

// Read API key from env (server-side)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL =
    process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

if (!OPENROUTER_API_KEY) {
    console.warn(
        "[agent] OPENROUTER_API_KEY is not set. Set it in your environment."
    );
}

const llm = new ChatOpenAI({
    configuration: { baseURL: OPENROUTER_BASE_URL },
    apiKey: OPENROUTER_API_KEY,
    // modelName: "z-ai/glm-4.5",
    // modelName: "openai/gpt-oss-120b",
    // modelName: "mistralai/mistral-medium-3",
    modelName: "mistralai/mistral-small-24b-instruct-2501",
    temperature: 0.7,
    modelKwargs: {
        // preset: "@preset/default",
        provider: {
            order: ["mistral"],
        },
    },
});

// SSE endpoint: POST /chat -> streams tokens as JSON events
app.post("/chat", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const userMessage: string = (req.body?.message ?? "").toString();
        const thread_id: string | undefined = req.body?.thread_id;
        const token = req.token;
        const user = req.user;
        console.log(
            `[agent] User ${user?.sub} (${user?.name}) started chat with token ${token}`
        );

        if (!token) {
            res.status(401).json({ error: "Unauthorized: Missing token" });
            return;
        }

        if (!userMessage) {
            res.status(400).json({ error: "message is required" });
            return;
        }

        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
        });

        const send = (event: StreamEventData) => {
            res.write(`data: ${JSON.stringify(event)}\n\n`);
        };

        const tools: AgentTool<ZodObject>[] = [
            getReadLibraryTool(token),
            getAddOrUpdateRecipeTool(token),
            getDeleteRecipeTool(token),
            getAddMealTool(token),
            getRemoveRecipeFromPlanTool(token),
            getReadPlanTool(token),
        ];
        const agent = createAgent(
            llm,
            tools.map(({ tool }) => tool)
        );
        const stream = await agent.streamEvents(
            { messages: [new HumanMessage(userMessage)] },
            { version: "v2", configurable: thread_id ? { thread_id } : {} }
        );
        let final = "";

        for await (const event of stream) {
            const e = event as StreamEvent;
            // Token chunks
            if (e.event === "on_chat_model_stream") {
                const content = e.data?.chunk?.content;
                const text = Array.isArray(content)
                    ? content
                          .map((p: any) =>
                              typeof p === "string"
                                  ? p
                                  : p?.text ?? p?.content ?? ""
                          )
                          .join("")
                    : typeof content === "string"
                    ? content
                    : "";
                if (text) {
                    final += text;
                    send({ type: "stream", chunk: text });
                }
            }
            // Tool lifecycle events
            if (e.event === "on_tool_start") {
                const toolName = e.name;
                const tool = tools.find((t) => t.tool.name === toolName);
                if (tool === undefined)
                    throw new Error(`Unknown tool started: ${toolName}`);

                const inputString = e.data.input?.input;
                if (!isValidToolIO(inputString))
                    throw new Error(
                        `Tool input is not a string: ${JSON.stringify(
                            inputString
                        )}`
                    );
                const input = tool.schema.safeParse(
                    inputString === undefined
                        ? undefined
                        : JSON.parse(inputString)
                );
                if (input.success === false) {
                    throw new Error(
                        `Tool input does not match schema: ${JSON.stringify(
                            input.error
                        )}`
                    );
                }
                console.log(
                    `Tool started: ${toolName} with input: ${JSON.stringify(
                        input
                    )}`
                );

                send({
                    type: "toolStart",
                    toolData: {
                        name: toolName,
                        updateEvent: tool.getToolUpdateEventOnToolStart?.(
                            input.data
                        ),
                    },
                });
            }
            if (e.event === "on_tool_end") {
                const toolName = e.name;
                const tool = tools.find((t) => t.tool.name === toolName);
                if (tool === undefined)
                    throw new Error(`Unknown tool started: ${toolName}`);

                const inputString = e.data.input?.input;
                if (!isValidToolIO(inputString))
                    throw new Error(
                        `Tool input is not a string: ${JSON.stringify(
                            inputString
                        )}`
                    );
                const input = tool.schema.safeParse(
                    inputString === undefined
                        ? undefined
                        : JSON.parse(inputString)
                );
                if (input.success === false) {
                    throw new Error(
                        `Tool input does not match schema: ${JSON.stringify(
                            input.error
                        )}`
                    );
                }

                const output = e.data.output?.lc_kwargs?.content;
                if (!isValidToolIO(output)) {
                    throw new Error(
                        `Tool output is not a string: ${JSON.stringify(output)}`
                    );
                }
                console.log(
                    `Tool ended: ${toolName} with input: ${JSON.stringify(
                        input
                    )} and output: ${output}`
                );
                send({
                    type: "toolEnd",
                    toolData: {
                        name: toolName,
                        updateEvent: tool.getToolUpdateEventOnToolEnd?.(
                            input.data,
                            output
                        ),
                    },
                });
            }
            // Final output from graph end/state
            if (e.event === "on_graph_end" || e.event === "on_chain_end") {
                const output = e.data?.output;
                if (typeof output === "string" && output) final = output;
                const maybeMessages = output?.messages;
                if (Array.isArray(maybeMessages) && maybeMessages.length > 0) {
                    const last = maybeMessages[maybeMessages.length - 1];
                    const content = last?.content;
                    const text = Array.isArray(content)
                        ? content
                              .map((p: any) =>
                                  typeof p === "string"
                                      ? p
                                      : p?.text ?? p?.content ?? ""
                              )
                              .join("")
                        : typeof content === "string"
                        ? content
                        : "";
                    if (text) final = text;
                }
            }
        }

        send({ type: "end", finalOutput: final });
        res.end();
    } catch (err: any) {
        // Send error as SSE then close
        try {
            res.writeHead(200, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache, no-transform",
                Connection: "keep-alive",
            });
            res.write(`event: error\n`);
            res.write(
                `data: ${JSON.stringify({
                    message: err?.message ?? "Unknown error",
                })}\n\n`
            );
        } catch {}
        res.end();
    }
});

const isValidToolIO = (input: any): input is string | undefined => {
    return (
        input === undefined ||
        (typeof input === "string" && input.trim().length > 0)
    );
};

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;
app.listen(PORT, () => {
    console.log(`[agent] SSE server listening on http://localhost:${PORT}`);
});
