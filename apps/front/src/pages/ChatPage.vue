<script setup lang="ts">
import AssistantMessage from "@/components/AssistantMessage.vue";
import ChatInput from "@/components/ChatInput.vue";
import ConversationDrawer from "@/components/ConversationDrawer.vue";
import UserMessage from "@/components/UserMessage.vue";
import { chatService } from "@/services/chatService";
import { useConversationsStore } from "@/stores/conversationsStore";
import { useThreadStore } from "@/stores/threadStore";
import { useToolDataUpdateStore } from "@/stores/toolDataUpdateStore";
import type { ChatMessage } from "@mealplanner/shared-all";
import { nextTick, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const threadStore = useThreadStore();
const conversationsStore = useConversationsStore();
const toolDataUpdateStore = useToolDataUpdateStore();

const isProcessing = ref(false);
const showDrawer = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

// ── Scroll helpers ──────────────────────────────────────────────────────────
async function scrollToBottom() {
    await nextTick();
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop =
            messagesContainer.value.scrollHeight;
    }
}

// ── Thread management ───────────────────────────────────────────────────────
function selectThread(id: string) {
    threadStore.setThreadId(id);
    showDrawer.value = false;
    router.replace(`/chat/${id}`);
}

async function deleteThread(id: string) {
    await conversationsStore.deleteThread(id);
    if (threadStore.threadId === id) {
        // Switch to most recent remaining thread, or start fresh
        const next = conversationsStore.threads[0];
        if (next) {
            selectThread(next.id);
        } else {
            startNewConversation();
        }
    }
}

function startNewConversation() {
    threadStore.resetThreadId();
    showDrawer.value = false;
    router.replace("/chat");
}

// ── Send message ────────────────────────────────────────────────────────────
async function handleSendMessage(message: string) {
    if (!message.trim() || isProcessing.value) return;

    // Add user message to store
    const userMessage: ChatMessage = {
        id: Date.now().toString(),
        isUser: true,
        parts: [{ type: "text", content: message }],
    };
    threadStore.messages = [...threadStore.messages, userMessage];
    await scrollToBottom();

    // Add empty bot message placeholder
    const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        isUser: false,
        parts: [],
    };
    threadStore.messages = [...threadStore.messages, botMessage];
    await scrollToBottom();

    isProcessing.value = true;

    try {
        const threadId = threadStore.threadId || undefined;

        const stream = chatService.sendMessageToBotStream(message, threadId);

        for await (const event of stream) {
            if (event.type === "streamStart") {
                const lastMsg =
                    threadStore.messages[threadStore.messages.length - 1];
                if (lastMsg && !lastMsg.isUser) {
                    lastMsg.parts.push({
                        type: "text",
                        content: "",
                        isStreaming: true,
                        runId: event.runId,
                    });
                    await scrollToBottom();
                }
            } else if (event.type === "stream") {
                const lastMsg =
                    threadStore.messages[threadStore.messages.length - 1];
                if (lastMsg && !lastMsg.isUser) {
                    const part = lastMsg.parts.find(
                        (p) => p.runId === event.runId,
                    );
                    if (part && part.type === "text") {
                        part.isStreaming = true;
                        part.content += event.chunk;
                    }
                    await scrollToBottom();
                }
            } else if (event.type === "streamEnd") {
                const lastMsg =
                    threadStore.messages[threadStore.messages.length - 1];
                if (lastMsg && !lastMsg.isUser) {
                    const part = lastMsg.parts.find(
                        (p) => p.runId === event.runId,
                    );
                    if (part && part.type === "text") {
                        part.isStreaming = false;
                        part.content = event.text;
                    }
                    await scrollToBottom();
                }
            } else if (event.type === "toolStart") {
                if (event.toolData.updateEvent) {
                    toolDataUpdateStore.updateDataOnToolStart(
                        event.toolData.updateEvent,
                    );
                }
                const lastMsg =
                    threadStore.messages[threadStore.messages.length - 1];
                if (lastMsg && !lastMsg.isUser) {
                    lastMsg.parts.push({
                        type: "tool",
                        status: "running",
                        runId: event.runId,
                        toolName: event.toolData.name,
                    });
                    await scrollToBottom();
                }
            } else if (event.type === "toolEnd") {
                if (event.toolData.updateEvent) {
                    toolDataUpdateStore.updateDataOnToolEnd(
                        event.toolData.updateEvent,
                    );
                }
                const lastMsg =
                    threadStore.messages[threadStore.messages.length - 1];
                if (lastMsg && !lastMsg.isUser) {
                    const part = lastMsg.parts.find(
                        (p) => p.runId === event.runId,
                    );
                    if (part && part.type === "tool") {
                        part.status = "completed";
                    }
                    await scrollToBottom();
                }
            } else if (event.type === "threadCreated") {
                // Agent created the thread (no thread_id was provided)
                threadStore.setThreadId(event.threadId);
                conversationsStore.updateThreadTitle(
                    event.threadId,
                    event.title,
                );
                // If thread wasn't in the list yet, refresh
                const exists = conversationsStore.threads.find(
                    (t) => t.id === event.threadId,
                );
                if (!exists) void conversationsStore.fetchThreads();
                router.replace(`/chat/${event.threadId}`);
            } else if (event.type === "threadTitleUpdated") {
                conversationsStore.updateThreadTitle(
                    event.threadId,
                    event.title,
                );
            } else if (event.type === "recipeCard") {
                const lastMsg =
                    threadStore.messages[threadStore.messages.length - 1];
                if (lastMsg && !lastMsg.isUser) {
                    lastMsg.parts.push({
                        type: "recipeCard",
                        recipe: event.recipe,
                    });
                    await scrollToBottom();
                }
            }
        }
    } catch (error) {
        console.error("Error sending message:", error);
        const lastMsg = threadStore.messages[threadStore.messages.length - 1];
        if (lastMsg && !lastMsg.isUser) {
            lastMsg.parts.push({
                type: "text",
                content: "Une erreur s'est produite. Veuillez réessayer.",
                isStreaming: false,
            });
        }
    } finally {
        isProcessing.value = false;
        // Refresh thread list to pick up title updates
        void conversationsStore.fetchThreads();
    }
}
</script>

<template>
    <div class="chat-page">
        <!-- Conversation drawer -->
        <ConversationDrawer
            :threads="conversationsStore.threads"
            :currentThreadId="threadStore.threadId"
            :isOpen="showDrawer"
            @select="selectThread"
            @delete="deleteThread"
            @new="startNewConversation"
            @close="showDrawer = false"
        />

        <!-- Header -->
        <header class="chat-header">
            <button class="header-btn" @click="showDrawer = true">≡</button>
            <span class="chat-title">MEALPLANNER</span>
            <button class="header-btn" @click="startNewConversation">✎</button>
        </header>

        <!-- Messages area -->
        <div ref="messagesContainer" class="messages-area">
            <div v-if="threadStore.messages.length === 0" class="empty-state">
                <p>Commencez par envoyer un message…</p>
            </div>
            <template v-for="msg in threadStore.messages" :key="msg.id">
                <UserMessage v-if="msg.isUser" :message="msg" />
                <AssistantMessage v-else :message="msg" />
            </template>
        </div>

        <!-- Input -->
        <ChatInput
            class="chat-input-wrapper"
            :disabled="isProcessing"
            @send-message="handleSendMessage"
        />
    </div>
</template>

<style scoped>
.chat-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--color-bg);
    position: relative;
}

/* Header */
.chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-bg);
    flex-shrink: 0;
}

.chat-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text);
    letter-spacing: 0.1em;
}

.header-btn {
    background: none;
    border: none;
    color: var(--color-muted);
    font-size: 18px;
    cursor: pointer;
    padding: 4px 8px;
    line-height: 1;
    transition: color 0.15s;
}

.header-btn:hover {
    color: var(--color-text);
}

/* Messages */
.messages-area {
    flex: 1;
    overflow-y: auto;
    padding: 16px 0;
    min-height: 0;
}

.empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--color-muted);
    font-size: 14px;
    text-align: center;
    padding: 20px;
}

/* Input */
.chat-input-wrapper {
    flex-shrink: 0;
    border-top: 1px solid var(--color-border);
    background: var(--color-bg);
}
</style>
