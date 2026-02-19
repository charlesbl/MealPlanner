import {
    AIMessage,
    AIMessageChunk,
    HumanMessage,
    ToolMessage,
} from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import type { StreamEvent } from "@langchain/core/tracers/log_stream";
import { ChatOpenAI } from "@langchain/openai";
import {
    ChatMessage,
    GetHistoryBodyResponse,
    Part,
    StreamEventData,
    chatMessageSchema,
    getHistorySchema,
} from "@mealplanner/shared-all";
import { AuthAPIResponse, requireAuth } from "@mealplanner/shared-back";
import cors from "cors";
import { config } from "dotenv";
import express, { Request } from "express";
import { ZodObject } from "zod";
import { createAgent, createCheckpointer } from "./agent.js";
import { getAddMealTool } from "./tools/addMealTool.js";
import { getAddOrUpdateRecipeTool } from "./tools/addOrUpdateRecipeTool.js";
import { getReadLibraryTool } from "./tools/readLibraryTool.js";
import { getReadPlanTool } from "./tools/readPlanTool.js";
import { getRemoveRecipeFromPlanTool } from "./tools/removeMealTool.js";
import { getDeleteRecipeTool } from "./tools/removeRecipeTool.js";
import { AgentTool } from "./tools/types.js";

//dotenv
config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENAI_BASE_URL =
    process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1";

if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
}

const llm = new ChatOpenAI({
    configuration: { baseURL: OPENAI_BASE_URL },
    apiKey: OPENROUTER_API_KEY,
    // modelName: "z-ai/glm-4.5",
    // modelName: "openai/gpt-oss-120b",
    // modelName: "mistralai/mistral-medium-3",
    modelName: "z-ai/glm-4.7",
    temperature: 0.7,
    modelKwargs: {
        // preset: "@preset/default",
        provider: {
            order: ["google-vertex"],
        },
    },
});

const checkpointer = await createCheckpointer();

app.post("/chat", requireAuth, async (req: Request, res: AuthAPIResponse) => {
    try {
        const parsed = chatMessageSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                status: "error",
                error: parsed.error.message,
            });
        }
        const { message: userMessage, thread_id } = parsed.data;
        const token = res.locals.token;
        const user = res.locals.user;
        console.log(
            `[agent] User ${user?.sub} (${user?.name}) started chat with token ${token}`
        );

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
            tools.map(({ tool }) => tool),
            checkpointer
        );
        const stream = await agent.streamEvents(
            { messages: [new HumanMessage(userMessage)] },
            { version: "v2", configurable: thread_id ? { thread_id } : {} }
        );
        let final = "";

        for await (const event of stream) {
            const e = event as StreamEvent;
            if (e.event === "on_chat_model_start") {
                send({ type: "streamStart", runId: e.run_id });
            }
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
                    send({ type: "stream", chunk: text, runId: e.run_id });
                }
            }
            if (e.event === "on_chat_model_end") {
                const text = e.data.output?.content;
                if (typeof text === "string") {
                    send({ type: "streamEnd", text: text, runId: e.run_id });
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
                    runId: e.run_id,
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
                    runId: e.run_id,
                });
            }
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

app.get(
    "/history",
    requireAuth,
    async (req: Request, res: AuthAPIResponse<GetHistoryBodyResponse>) => {
        try {
            const parsed = getHistorySchema.safeParse(req.query);
            if (!parsed.success) {
                return res.status(400).json({
                    status: "error",
                    error: parsed.error.message,
                });
            }
            const { thread_id } = parsed.data;

            const config: RunnableConfig = {
                configurable: { thread_id },
            };

            // Read the latest (or specific) checkpoint for this thread
            const tuple = await checkpointer.getTuple(config);
            if (!tuple) {
                return res.json({
                    status: "success",
                    data: {
                        messages: [],
                    },
                });
            }

            const checkpoint = tuple.checkpoint;
            const chValues = checkpoint.channel_values;
            const rawMessages = chValues.messages;

            const messageParts = Array.isArray(rawMessages)
                ? convertLangChainMessagesToChatMessages(rawMessages)
                : [];

            const payload = {
                thread_id,
                checkpoint_id: checkpoint.id,
                ts: checkpoint.ts,
                count: messageParts.length,
                messages: messageParts,
            };

            return res.json({
                status: "success",
                data: payload,
            });
        } catch (err: any) {
            console.error("[agent] /history error:", err);
            return res.status(500).json({
                status: "error",
                error: err?.message ?? "Unknown error",
            });
        }
    }
);

type LangChainMessage =
    | {
          role: "user";
          message: HumanMessage;
      }
    | {
          role: "assistant";
          message: AIMessage | AIMessageChunk;
      }
    | {
          role: "tool";
          message: ToolMessage;
      };
const convertLangChainMessagesToChatMessages = (
    langchainMessages: unknown[]
): ChatMessage[] => {
    const getCastedMessage = (m: unknown): LangChainMessage | undefined => {
        if (m instanceof HumanMessage) return { role: "user", message: m };
        if (m instanceof AIMessage || m instanceof AIMessageChunk)
            return { role: "assistant", message: m };
        if (m instanceof ToolMessage) return { role: "tool", message: m };
        return undefined;
    };

    const transformToPart = ({
        role,
        message,
    }: LangChainMessage): Part | undefined => {
        if (role === "user") {
            return { type: "text", content: message.text };
        }
        if (role === "assistant") {
            return { type: "text", content: message.text };
        }
        if (role === "tool") {
            return {
                type: "tool",
                status: "completed",
                toolName: message.name ?? "unknown",
            };
        }
        throw new Error(`Unknown role: ${role}`);
    };

    const messages: ChatMessage[] = [];
    langchainMessages.forEach((m, i): Part | undefined => {
        const cast = getCastedMessage(m);
        if (cast === undefined) return;
        const { role, message } = cast;
        const part = transformToPart(cast);
        if (part === undefined) return;
        if (role === "user") {
            messages.push({
                id: message.id ?? i.toString(),
                isUser: role === "user",
                parts: [part],
            });
            return;
        }
        const lastMessage = messages[messages.length - 1];
        if (lastMessage === undefined || lastMessage.isUser) {
            messages.push({
                id: message.id ?? i.toString(),
                isUser: false,
                parts: [part],
            });
            return;
        }
        lastMessage.parts.push(part);
    });
    return messages;
};

const isValidToolIO = (input: any): input is string | undefined => {
    return (
        input === undefined ||
        (typeof input === "string" && input.trim().length > 0)
    );
};

if (process.env.PORT === undefined) {
    throw new Error("PORT environment variable is not set");
}
const PORT = Number(process.env.PORT);
if (isNaN(PORT) || PORT <= 0 || PORT >= 65536) {
    throw new Error("PORT environment variable is not a valid port number");
}
app.listen(PORT, () => {
    console.log(`[agent] SSE server listening on http://localhost:${PORT}`);
});
