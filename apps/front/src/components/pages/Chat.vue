<script lang="ts" setup>
import { chatService } from "@/services/chatService";
import { useThreadStore } from "@/stores/threadStore";
import { useToolDataUpdateStore } from "@/stores/toolDataUpdateStore";
import type { ChatMessage } from "@mealplanner/shared-all";
import { nextTick, ref } from "vue";
import AssistantMessage from "../AssistantMessage.vue";
import ChatInput from "../ChatInput.vue";
import UserMessage from "../UserMessage.vue";
import Settings from "./Settings.vue";

const toolDataUpdateStore = useToolDataUpdateStore();
const threadStore = useThreadStore();

const isProcessing = ref(false);
const messagesContainer = ref<HTMLElement>();
const showSettings = ref(false);

const clearChatHistory = () => {
    threadStore.resetThreadId();
};

const toggleSettings = () => {
    showSettings.value = !showSettings.value;
};

const closeSettings = () => {
    showSettings.value = false;
};

const scrollToBottom = async () => {
    await nextTick();
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop =
            messagesContainer.value.scrollHeight;
    }
};

const handleSendMessage = async (message: string) => {
    if (!message.trim() || isProcessing.value) return;

    // Add user message
    const userMessage: ChatMessage = {
        id: Date.now().toString(),
        isUser: true,
        parts: [
            {
                type: "text",
                content: message,
            },
        ],
    };

    threadStore.messages = [...threadStore.messages, userMessage];
    await scrollToBottom();

    // Add bot message placeholder for streaming
    const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        isUser: false,
        parts: [],
    };
    threadStore.messages = [...threadStore.messages, botMessage];
    await scrollToBottom();

    isProcessing.value = true;

    try {
        const stream = chatService.sendMessageToBotStream(
            message,
            threadStore.threadId
        );

        for await (const event of stream) {
            if (event.type === "streamStart") {
                // Update the bot message content
                const lastMessage =
                    threadStore.messages[threadStore.messages.length - 1];
                if (lastMessage && !lastMessage.isUser) {
                    lastMessage.parts.push({
                        type: "text",
                        content: "",
                        isStreaming: true,
                        runId: event.runId,
                    });

                    await scrollToBottom();
                }
            } else if (event.type === "stream") {
                // Update the bot message content
                const lastMessage =
                    threadStore.messages[threadStore.messages.length - 1];
                if (lastMessage && !lastMessage.isUser) {
                    const part = lastMessage.parts.find(
                        (part) => part.runId === event.runId
                    );
                    if (part != undefined && part.type === "text") {
                        part.isStreaming = true;
                        part.content += event.chunk;
                    } else {
                        throw new Error(
                            "No matching part found for runId: " + event.runId
                        );
                    }

                    await scrollToBottom();
                }
            } else if (event.type === "streamEnd") {
                // Update the bot message content
                const lastMessage =
                    threadStore.messages[threadStore.messages.length - 1];
                if (lastMessage && !lastMessage.isUser) {
                    const part = lastMessage.parts.find(
                        (part) => part.runId === event.runId
                    );
                    if (part != undefined && part.type === "text") {
                        part.isStreaming = false;
                        part.content = event.text;
                    } else {
                        throw new Error(
                            "No matching part found for runId: " + event.runId
                        );
                    }

                    await scrollToBottom();
                }
            } else if (event.type === "toolStart") {
                // Tool is being called
                // Call event handler to update datas
                if (event.toolData.updateEvent !== undefined)
                    toolDataUpdateStore.updateDataOnToolStart(
                        event.toolData.updateEvent
                    );
                // show indicator
                const lastMessage =
                    threadStore.messages[threadStore.messages.length - 1];
                if (lastMessage && !lastMessage.isUser) {
                    lastMessage.parts.push({
                        type: "tool",
                        status: "running",
                        runId: event.runId,
                        toolName: event.toolData.name,
                    });
                    await scrollToBottom();
                }
            } else if (event.type === "toolEnd") {
                // Tool execution completed
                // Call event handler to update datas
                if (event.toolData.updateEvent !== undefined)
                    toolDataUpdateStore.updateDataOnToolEnd(
                        event.toolData.updateEvent
                    );
                // update indicator
                const lastMessage =
                    threadStore.messages[threadStore.messages.length - 1];
                if (lastMessage && !lastMessage.isUser) {
                    const part = lastMessage.parts.find(
                        (part) => part.runId === event.runId
                    );
                    if (part && part.type === "tool") {
                        part.status = "completed";
                    } else {
                        throw new Error(
                            "No matching part found for runId: " + event.runId
                        );
                    }
                    await scrollToBottom();
                }
            }
        }
    } catch (error) {
        console.error("Error sending message:", error);

        // Update the bot message with error
        const lastMessage =
            threadStore.messages[threadStore.messages.length - 1];
        if (lastMessage && !lastMessage.isUser) {
            lastMessage.parts.push({
                type: "text",
                content: "Sorry, I encountered an error. Please try again.",
                isStreaming: false,
            });
        }
    } finally {
        isProcessing.value = false;
    }
};
console.log(threadStore.messages);
</script>

<template>
    <div class="chat-container">
        <!-- Page de paramètres (overlay) -->
        <div v-if="showSettings" class="settings-overlay">
            <Settings @close="closeSettings" />
        </div>

        <!-- Header -->
        <div
            class="chat-header"
            :class="{ 'is-empty': threadStore.messages.length === 0 }"
        >
            <button
                v-if="threadStore.messages.length > 0"
                @click="clearChatHistory"
                class="clear-button"
            >
                Clear Chat
            </button>
            <button @click="toggleSettings" class="settings-button">⚙️</button>
        </div>

        <div ref="messagesContainer" class="messages">
            <template v-for="message in threadStore.messages">
                <UserMessage
                    v-if="message.isUser"
                    :key="message.id + '-user'"
                    :message="message"
                />
                <AssistantMessage
                    v-else
                    :key="message.id + '-assistant'"
                    :message="message"
                />
            </template>
            <div v-if="threadStore.messages.length === 0" class="empty-state">
                <p>Start a conversation by typing a message below!</p>
            </div>
        </div>
        <ChatInput
            ref="chatInputRef"
            class="chat-input"
            :disabled="isProcessing"
            @send-message="handleSendMessage"
        />
    </div>
</template>

<style scoped>
.chat-container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    background-color: var(--bg-primary);
    position: relative;
}

.settings-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    background-color: var(--bg-primary);
}

.chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-medium);
    background-color: var(--bg-primary);
    flex-shrink: 0;
}

.chat-header.is-empty {
    justify-content: flex-end;
}

.clear-button {
    padding: 6px 12px;
    background-color: var(--accent-red);
    color: var(--bg-primary);
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.clear-button:hover {
    background-color: var(--accent-red-hover);
}

.clear-button:active {
    transform: scale(0.98);
}

.settings-button {
    padding: 8px;
    background: none;
    border: 1px solid var(--border-medium);
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    color: var(--text-secondary);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
}

.settings-button:hover {
    background-color: var(--bg-hover);
    border-color: var(--border-dark);
    color: var(--text-primary);
    transform: translateY(-1px);
}

.settings-button:active {
    transform: translateY(0);
}

.messages {
    overflow-y: auto;
    flex-grow: 1;
    padding: 16px 0;
    background-color: var(--bg-secondary);
    min-height: 0;
}

.empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-tertiary);
    text-align: center;
    padding: 20px;
}

.empty-state p {
    font-size: 16px;
    margin: 0;
}

.chat-input {
    flex-shrink: 0;
    border-top: 1px solid var(--border-medium);
    background-color: var(--bg-primary);
}
</style>
