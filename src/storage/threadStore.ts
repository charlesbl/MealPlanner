/**
 * Thread Store - provides a stable thread_id for LangGraph checkpointer
 * Persistence: localStorage (browser)
 */

const THREAD_KEY = "langgraph_thread_id";

function generateThreadId(): string {
    // Simple 24-char base36 id; sufficient for local threading
    return (
        Date.now().toString(36) + Math.random().toString(36).slice(2, 16)
    ).slice(0, 24);
}

export function getOrCreateThreadId(): string {
    if (typeof localStorage === "undefined") return generateThreadId();
    let id = localStorage.getItem(THREAD_KEY);
    if (!id) {
        id = generateThreadId();
        localStorage.setItem(THREAD_KEY, id);
    }
    return id;
}

export function resetThreadId(): string {
    const id = generateThreadId();
    if (typeof localStorage !== "undefined") {
        localStorage.setItem(THREAD_KEY, id);
    }
    return id;
}
