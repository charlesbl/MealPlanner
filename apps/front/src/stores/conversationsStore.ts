import { threadService, type ThreadSummary } from "@mealplanner/shared-all";
import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useAuthStore } from "./authStore";

export const useConversationsStore = defineStore("conversations", () => {
    const auth = useAuthStore();
    const threads = ref<ThreadSummary[]>([]);
    const loading = ref(false);

    async function fetchThreads() {
        if (!auth.token) return;
        loading.value = true;
        try {
            const list = await threadService.listThreads(auth.token);
            // Sort by lastMessageAt desc
            threads.value = list.sort(
                (a, b) =>
                    new Date(b.lastMessageAt).getTime() -
                    new Date(a.lastMessageAt).getTime(),
            );
        } catch (e) {
            console.error("fetchThreads error:", e);
        } finally {
            loading.value = false;
        }
    }

    async function createThread(): Promise<string> {
        if (!auth.token) throw new Error("Not authenticated");
        const t = await threadService.createThread(auth.token);
        threads.value.unshift({
            id: t.id,
            title: t.title,
            lastMessageAt: t.lastMessageAt,
        });
        return t.id;
    }

    async function deleteThread(id: string) {
        if (!auth.token) return;
        await threadService.deleteThread(id, auth.token);
        threads.value = threads.value.filter((t) => t.id !== id);
    }

    function updateThreadTitle(id: string, title: string) {
        const t = threads.value.find((t) => t.id === id);
        if (t) t.title = title;
    }

    function touchThread(id: string) {
        const t = threads.value.find((t) => t.id === id);
        if (t) {
            t.lastMessageAt = new Date();
            threads.value.sort(
                (a, b) =>
                    new Date(b.lastMessageAt).getTime() -
                    new Date(a.lastMessageAt).getTime(),
            );
        }
    }

    watch(
        () => auth.token,
        (token) => {
            if (token) void fetchThreads();
            else threads.value = [];
        },
        { immediate: true },
    );

    return {
        threads,
        loading,
        fetchThreads,
        createThread,
        deleteThread,
        updateThreadTitle,
        touchThread,
    };
});
