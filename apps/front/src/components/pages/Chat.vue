<script lang="ts" setup>
import { sendMessageToBotStream } from "@/services/chatService";
import { getOrCreateThreadId, resetThreadId } from "@/stores/threadStore";
import { nextTick, ref } from "vue";
import ChatInput from "../ChatInput.vue";
import Message from "../Message.vue";
import Settings from "./Settings.vue";
import { useToolDataUpdateStore } from "@/stores/toolDataUpdateStore";

interface ChatMessage {
    id: string;
    content: string;
    isUser: boolean;
    isStreaming?: boolean;
}

const toolDataUpdateStore = useToolDataUpdateStore();

const messages = ref<ChatMessage[]>([]);
const isProcessing = ref(false);
const messagesContainer = ref<HTMLElement>();
const showSettings = ref(false);

const clearChatHistory = () => {
    // Reset local UI and server-side memory by rotating the thread id
    messages.value = [];
    resetThreadId();
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
        content: message,
        isUser: true,
    };
    messages.value.push(userMessage);
    await scrollToBottom();

    // Add bot message placeholder for streaming
    const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "",
        isUser: false,
        isStreaming: true,
    };
    messages.value.push(botMessage);
    await scrollToBottom();

    isProcessing.value = true;

    try {
        const threadId = getOrCreateThreadId();
        const stream = sendMessageToBotStream(message, threadId);

        for await (const event of stream) {
            if (event.type === "stream") {
                // Update the bot message content
                const lastMessage = messages.value[messages.value.length - 1];
                if (lastMessage && !lastMessage.isUser) {
                    lastMessage.content += event.chunk;
                    await scrollToBottom();
                }
            } else if (event.type === "end") {
                // Final message received, stop streaming indicator
                const lastMessage = messages.value[messages.value.length - 1];
                if (lastMessage && !lastMessage.isUser) {
                    // TODO ne pas remplacer tous le message mais vérifier si il manque pas des chunks et fix le message final en gardant tous les chunks, y compris les chunks de reasonning et les tool calls
                    // TODO bien séparer le message final des tokens de reasonning visuellement
                    // TODO gérer les tool calls et les tool end via des composant et pas juste en concaténant le message dégulassement
                    // lastMessage.content = event.finalOutput;
                    lastMessage.isStreaming = false;
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
                const lastMessage = messages.value[messages.value.length - 1];
                if (lastMessage && !lastMessage.isUser) {
                    lastMessage.content += `\n🔧 Using ${event.toolData.name}...`;
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
                const lastMessage = messages.value[messages.value.length - 1];
                if (lastMessage && !lastMessage.isUser) {
                    lastMessage.content += `\n✅ ${event.toolData.name} completed.`;
                    await scrollToBottom();
                }
            }
        }
    } catch (error) {
        console.error("Error sending message:", error);

        // Update the bot message with error
        const lastMessage = messages.value[messages.value.length - 1];
        if (lastMessage && !lastMessage.isUser) {
            lastMessage.content =
                "Sorry, I encountered an error. Please try again.";
            lastMessage.isStreaming = false;
        }
    } finally {
        isProcessing.value = false;
    }
};
</script>

<template>
    <div class="chat-container">
        <!-- Page de paramètres (overlay) -->
        <div v-if="showSettings" class="settings-overlay">
            <Settings @close="closeSettings" />
        </div>

        <!-- Interface de chat normale -->
        <div class="chat-header" v-if="messages.length > 0">
            <button @click="clearChatHistory" class="clear-button">
                Clear Chat
            </button>
            <button @click="toggleSettings" class="settings-button">⚙️</button>
        </div>

        <!-- Header pour les paramètres quand il n'y a pas de messages -->
        <div v-else class="chat-header-empty">
            <button @click="toggleSettings" class="settings-button">⚙️</button>
        </div>

        <div ref="messagesContainer" class="messages">
            <!-- TODO make bot message full width like ChatGPT -->
            <Message
                v-for="message in messages"
                :key="message.id"
                :content="message.content"
                :is-user="message.isUser"
                :is-streaming="message.isStreaming"
            />
            <div v-if="messages.length === 0" class="empty-state">
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

.chat-header-empty {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-medium);
    background-color: var(--bg-primary);
    flex-shrink: 0;
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
