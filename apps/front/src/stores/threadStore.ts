/**
 * Thread Store (Pinia) - manages the current conversation thread_id and messages
 */
import { chatService } from "@/services/chatService";
import type { ChatMessage } from "@mealplanner/shared-all";
import { defineStore } from "pinia";
import { ref, watch } from "vue";

const THREAD_KEY = "langgraph_thread_id";

export const useThreadStore = defineStore("thread", () => {
    const threadId = ref<string>(localStorage.getItem(THREAD_KEY) ?? "");
    const messages = ref<ChatMessage[]>([]);
    const skipNextHistoryFetch = ref(false);

    // Persist to localStorage whenever threadId changes
    watch(threadId, (newId) => {
        if (newId) {
            localStorage.setItem(THREAD_KEY, newId);
        } else {
            localStorage.removeItem(THREAD_KEY);
        }
    });

    // Auto-fetch history when threadId changes
    watch(
        threadId,
        async (newId) => {
            if (skipNextHistoryFetch.value) {
                skipNextHistoryFetch.value = false;
                return;
            }
            if (!newId) {
                messages.value = [];
                return;
            }
            try {
                const res = await chatService.getHistory(newId);
                messages.value = res.messages;
            } catch {
                messages.value = [];
            }
        },
        { immediate: true },
    );

    function setThreadId(id: string, options?: { hydrateHistory?: boolean }) {
        if (options?.hydrateHistory === false) {
            skipNextHistoryFetch.value = true;
        }
        threadId.value = id;
    }

    function resetThreadId() {
        threadId.value = "";
        messages.value = [];
    }

    return { threadId, messages, setThreadId, resetThreadId };
});
