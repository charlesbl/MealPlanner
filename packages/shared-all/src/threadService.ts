import type { APIResponsePayload } from "./schemas/common.schemas.js";
import type {
    ListThreadsResponse,
    Thread,
    ThreadSummary,
} from "./schemas/thread.schemas.js";
import { getApiBase } from "./utils.js";

async function createThread(token: string): Promise<Thread> {
    const res = await fetch(`${getApiBase()}/threads`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) throw new Error(`Create thread failed: ${res.status}`);
    const body: APIResponsePayload<Thread> = await res.json();
    if (body.status === "error") throw new Error(body.error);
    return body.data;
}

async function updateThread(
    id: string,
    patch: { title?: string; lastMessageAt?: string },
    token: string,
): Promise<void> {
    const res = await fetch(`${getApiBase()}/threads/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error(`Update thread failed: ${res.status}`);
}

async function listThreads(token: string): Promise<ThreadSummary[]> {
    const res = await fetch(`${getApiBase()}/threads`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`List threads failed: ${res.status}`);
    const body: ListThreadsResponse = await res.json();
    if (body.status === "error") throw new Error(body.error);
    return body.data;
}

async function deleteThread(id: string, token: string): Promise<void> {
    const res = await fetch(`${getApiBase()}/threads/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Delete thread failed: ${res.status}`);
}

export const threadService = {
    createThread,
    updateThread,
    listThreads,
    deleteThread,
};
