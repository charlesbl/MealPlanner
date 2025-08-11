import type { RunnableConfig } from "@langchain/core/runnables";
import {
    BaseCheckpointSaver,
    type ChannelVersions,
    type Checkpoint,
    type CheckpointListOptions,
    type CheckpointMetadata,
    type CheckpointTuple,
    type PendingWrite,
} from "@langchain/langgraph-checkpoint";
import { v4 as uuidv4 } from "uuid";

/**
 * ApiCheckpointSaver (stub)
 *
 * Objectif: appeler plus tard l'API backend pour persister les checkpoints/messages.
 * Pour l'instant c'est une implémentation mémoire minimale respectant l'interface
 * afin de préparer l'intégration. On ajoutera ensuite les appels HTTP
 * (create thread, save checkpoint, list, etc.).
 */
// TODO this is not working yet
export class ApiCheckpointSaver extends BaseCheckpointSaver<number> {
    private checkpoints: Map<string, CheckpointTuple[]> = new Map();
    private pendingWrites: Map<string, PendingWrite[]> = new Map();

    constructor() {
        super();
    }

    async put(
        config: RunnableConfig,
        checkpoint: Checkpoint,
        metadata: CheckpointMetadata,
        newVersions: ChannelVersions
    ): Promise<RunnableConfig> {
        console.log("[ApiCheckpointSaver] Saving checkpoint", {
            config,
            checkpoint,
            metadata,
            newVersions,
        });
        const threadId = config?.configurable?.thread_id;
        if (!threadId) return config;
        const id = checkpoint.id || uuidv4();
        checkpoint.id = id;
        const tuple: CheckpointTuple = {
            config: {
                configurable: {
                    thread_id: threadId,
                    checkpoint_id: id,
                    checkpoint_ns: config?.configurable?.checkpoint_ns ?? "",
                },
            },
            checkpoint,
            metadata,
            pendingWrites: (this.pendingWrites.get(threadId) || []).map(
                (pw) => ["task", ...pw] as any
            ),
        };
        const arr = this.checkpoints.get(threadId) || [];
        const idx = arr.findIndex(
            (c) => c.config?.configurable?.checkpoint_id === id
        );
        if (idx >= 0) arr[idx] = tuple;
        else arr.push(tuple);
        this.checkpoints.set(threadId, arr);
        this.pendingWrites.delete(threadId);
        return tuple.config;
    }

    async putWrites(
        config: RunnableConfig,
        writes: PendingWrite[],
        taskId: string
    ): Promise<void> {
        const threadId = config?.configurable?.thread_id;
        if (!threadId || !writes?.length) return;
        const current = this.pendingWrites.get(threadId) || [];
        current.push(...writes);
        this.pendingWrites.set(threadId, current);
    }

    async getTuple(
        config: RunnableConfig
    ): Promise<CheckpointTuple | undefined> {
        const threadId = config?.configurable?.thread_id;
        if (!threadId) return undefined;
        const checkpointId = config?.configurable?.checkpoint_id;
        const arr = this.checkpoints.get(threadId) || [];
        if (!checkpointId) return arr[arr.length - 1];
        return arr.find(
            (c) => c.config?.configurable?.checkpoint_id === checkpointId
        );
    }

    async *list(
        config: RunnableConfig,
        options?: CheckpointListOptions
    ): AsyncGenerator<CheckpointTuple> {
        const threadId = config?.configurable?.thread_id;
        if (!threadId) return;
        const arr = this.checkpoints.get(threadId) || [];
        for (const tuple of [...arr].reverse()) {
            yield tuple;
        }
    }

    async deleteThread(threadId: string): Promise<void> {
        this.checkpoints.delete(threadId);
        this.pendingWrites.delete(threadId);
    }
}
