import { HumanMessage } from "@langchain/core/messages";
import type { StreamEvent } from "@langchain/core/tracers/log_stream";
import { ChatOpenAI } from "@langchain/openai";
import { requireAuth } from "@mealplanner/shared-back";
import cors from "cors";
import { config } from "dotenv";
import express, { Request, Response } from "express";
import { createAgent } from "./agent.js";

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
    modelName: "z-ai/glm-4.5",
    temperature: 0.7,
});
const agent = createAgent(llm);

// SSE endpoint: POST /chat -> streams tokens as JSON events
app.post("/chat", requireAuth(), async (req: Request, res: Response) => {
    try {
        const userMessage: string = (req.body?.message ?? "").toString();
        const thread_id: string | undefined = req.body?.thread_id;

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

        const send = (event: string, data: unknown) => {
            res.write(`event: ${event}\n`);
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        };

        const stream = await agent.streamEvents(
            { messages: [new HumanMessage(userMessage)] },
            { version: "v2", configurable: thread_id ? { thread_id } : {} }
        );
        let final = "";

        for await (const event of stream) {
            const e = event as StreamEvent;
            // Token chunks
            if (e.event === "on_chat_model_stream") {
                const content = (e as any)?.data?.chunk?.content;
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
                    send("token", { chunk: text });
                }
            }
            // Tool lifecycle events
            if (e.event === "on_tool_start") {
                const toolName = (e as any)?.data?.name || e.name || "tool";
                send("tool_call", { name: toolName });
            }
            if (e.event === "on_tool_end") {
                const toolName = (e as any)?.data?.name || e.name || "tool";
                send("tool_end", { name: toolName });
            }
            // Final output from graph end/state
            if (e.event === "on_graph_end" || e.event === "on_chain_end") {
                const output = (e as any)?.data?.output;
                if (typeof output === "string" && output) final = output;
                const maybeMessages = (output as any)?.messages;
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

        send("done", { text: final });
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

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;
app.listen(PORT, () => {
    console.log(`[agent] SSE server listening on http://localhost:${PORT}`);
});
