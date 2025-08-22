/**
 * Thread Store (Pinia) - manages the current conversation thread_id
 * Persistence: localStorage (browser)
 */
import { chatService } from "@/services/chatService";
import type { ChatMessage } from "@mealplanner/shared-all";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";

const THREAD_KEY = "langgraph_thread_id";

function generateThreadId(): string {
    // Simple 24-char base36 id; sufficient for local threading
    return (
        Date.now().toString(36) + Math.random().toString(36).slice(2, 16)
    ).slice(0, 24);
}

function readInitialThreadId(): string {
    if (typeof localStorage === "undefined") return generateThreadId();
    const id = localStorage.getItem(THREAD_KEY);
    if (!id) {
        const newId = generateThreadId();
        localStorage.setItem(THREAD_KEY, newId);
        return newId;
    }
    return id;
}

export const useThreadStore = defineStore("thread", () => {
    const threadId = ref<string>(readInitialThreadId());
    const readOnlyThreadId = computed(() => threadId.value);

    const messages = ref<ChatMessage[]>([]);

    watch(threadId, (newId) => {
        if (typeof localStorage === "undefined") return;
        localStorage.setItem(THREAD_KEY, newId);
    });

    watch(
        threadId,
        async (newId) => {
            const newMessages = await chatService.getHistory(newId);
            messages.value = newMessages.messages;
        },
        { immediate: true }
    );

    function resetThreadId() {
        threadId.value = generateThreadId();
    }

    return { threadId: readOnlyThreadId, messages, resetThreadId };
});
