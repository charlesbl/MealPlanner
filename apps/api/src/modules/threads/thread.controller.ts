import type { Thread, ThreadSummary } from "@mealplanner/shared-all";
import type { APIResponsePayload } from "@mealplanner/shared-all";
import type { AuthAPIResponse } from "@mealplanner/shared-back";
import { Request } from "express";
import crypto from "node:crypto";
import { AppDataSource } from "../../data-source.js";
import { ThreadEntity } from "./thread.entity.js";

type ListResponse = APIResponsePayload<ThreadSummary[]>;
type SingleResponse = APIResponsePayload<Thread>;

function toThread(entity: ThreadEntity, userId: string): Thread {
    return {
        id: entity.id,
        userId,
        title: entity.title,
        createdAt: entity.createdAt,
        lastMessageAt: entity.lastMessageAt,
    };
}

function toSummary(entity: ThreadEntity): ThreadSummary {
    return {
        id: entity.id,
        title: entity.title,
        lastMessageAt: entity.lastMessageAt,
    };
}

export function threadsControllerFactory() {
    const repo = AppDataSource.getRepository(ThreadEntity);

    return {
        list: async (req: Request, res: AuthAPIResponse<ListResponse>) => {
            const userId = res.locals.user.sub;
            const threads = await repo.find({
                where: { user: { id: userId } },
                order: { lastMessageAt: "DESC" },
            });
            res.json({ status: "success", data: threads.map(toSummary) });
        },

        create: async (req: Request, res: AuthAPIResponse<SingleResponse>) => {
            const userId = res.locals.user.sub;
            const id = crypto.randomUUID();
            const thread = repo.create({
                id,
                user: { id: userId },
                title: "Nouvelle conversation",
                lastMessageAt: new Date(),
            });
            await repo.save(thread);
            res.status(201).json({ status: "success", data: toThread(thread, userId) });
        },

        update: async (req: Request, res: AuthAPIResponse<SingleResponse>) => {
            const userId = res.locals.user.sub;
            const { id } = req.params;
            const thread = await repo.findOne({ where: { id, user: { id: userId } } });
            if (!thread) {
                return res
                    .status(404)
                    .json({ status: "error", error: "Thread not found" });
            }
            const { title, lastMessageAt } = req.body as {
                title?: string;
                lastMessageAt?: string;
            };
            if (title !== undefined) thread.title = title;
            if (lastMessageAt !== undefined)
                thread.lastMessageAt = new Date(lastMessageAt);
            await repo.save(thread);
            res.json({ status: "success", data: toThread(thread, userId) });
        },

        remove: async (req: Request, res: AuthAPIResponse<never>) => {
            const userId = res.locals.user.sub;
            const { id } = req.params;
            const thread = await repo.findOne({ where: { id, user: { id: userId } } });
            if (!thread) {
                return res
                    .status(404)
                    .json({ status: "error", error: "Thread not found" });
            }
            await repo.remove(thread);
            res.status(204).send();
        },
    };
}
