<script lang="ts" setup>
import { sendMessageToBotStream } from "@/services/chatService";
import { loadChatHistory, saveChatHistory } from "@/storage/chatHistoryStorage";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { nextTick, onMounted, ref, watch } from "vue";
import ChatInput from "../ChatInput.vue";
import Message from "../Message.vue";

interface ChatMessage {
    id: string;
    content: string;
    isUser: boolean;
    isStreaming?: boolean;
}

const messages = ref<ChatMessage[]>([]);
const isProcessing = ref(false);
const messagesContainer = ref<HTMLElement>();

onMounted(() => {
    loadChatHistoryFromStorage();
});

watch(
    messages,
    (newMessages) => {
        saveChatHistoryToStorage(newMessages);
    },
    { deep: true }
);

const loadChatHistoryFromStorage = async () => {
    const storedHistory = loadChatHistory();
    const loadedMessages: ChatMessage[] = storedHistory.map((msg, index) => ({
        id: `stored-${index}-${Date.now()}`,
        content:
            typeof msg.content === "string"
                ? msg.content
                : JSON.stringify(msg.content),
        isUser: msg instanceof HumanMessage,
        isStreaming: false,
    }));
    messages.value = loadedMessages;

    if (loadedMessages.length > 0) {
        await scrollToBottom();
    }
};

const saveChatHistoryToStorage = (chatMessages: ChatMessage[]) => {
    const baseMessages = chatMessages.map((msg) => {
        if (msg.isUser) {
            return new HumanMessage(msg.content);
        } else {
            return new AIMessage(msg.content);
        }
    });
    saveChatHistory(baseMessages);
};

const clearChatHistory = () => {
    messages.value = [];
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
        const stream = sendMessageToBotStream(message);

        for await (const event of stream) {
            if (event.type === "chat_model_stream") {
                // Update the bot message content
                const lastMessage = messages.value[messages.value.length - 1];
                if (lastMessage && !lastMessage.isUser) {
                    lastMessage.content += event.chunk;
                    await scrollToBottom();
                }
            } else if (event.type === "chain_end") {
                // Final message received, stop streaming indicator
                const lastMessage = messages.value[messages.value.length - 1];
                if (lastMessage && !lastMessage.isUser) {
                    lastMessage.content = event.finalOutput;
                    lastMessage.isStreaming = false;
                    await scrollToBottom();
                }
            } else if (event.type === "tool_call") {
                // Tool is being called, show indicator
                const lastMessage = messages.value[messages.value.length - 1];
                if (lastMessage && !lastMessage.isUser) {
                    lastMessage.content += `\n🔧 Using ${event.toolName}...`;
                    await scrollToBottom();
                }
            } else if (event.type === "tool_end") {
                // Tool execution completed
                const lastMessage = messages.value[messages.value.length - 1];
                if (lastMessage && !lastMessage.isUser) {
                    lastMessage.content += `\n✅ ${event.toolName} completed.`;
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
        <div class="chat-header" v-if="messages.length > 0">
            <button @click="clearChatHistory" class="clear-button">
                Clear Chat
            </button>
        </div>
        <div ref="messagesContainer" class="messages">
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
    background-color: #ffffff;
}

.chat-header {
    display: flex;
    justify-content: flex-end;
    padding: 12px 16px;
    border-bottom: 1px solid #e1e5e9;
    background-color: #ffffff;
    flex-shrink: 0;
}

.clear-button {
    padding: 6px 12px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.clear-button:hover {
    background-color: #c82333;
}

.clear-button:active {
    transform: scale(0.98);
}

.messages {
    overflow-y: auto;
    flex-grow: 1;
    padding: 16px 0;
    background-color: #fafafa;
    min-height: 0;
}

.empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    text-align: center;
    padding: 20px;
}

.empty-state p {
    font-size: 16px;
    margin: 0;
}

.chat-input {
    flex-shrink: 0;
    border-top: 1px solid #e1e5e9;
    background-color: #ffffff;
}
</style>
