<script setup lang="ts">
import { chatHistoryManager } from "@/chat/chatHistoryManager";
import { sendMessageToBotStream } from "@/services/chatService"; // Import clearChatHistory
import type {
    ChatModelStreamEventData,
    ToolCallEventData,
    ToolEndEventData,
} from "@/services/streamEventHandlers";
import { renderMarkdown } from "@/utils/markdown"; // Import from utility
import { isHumanMessage } from "@langchain/core/messages";
import { computed, nextTick, onMounted, ref } from "vue";

interface Message {
    content: MessageContent[];
    sender: "user" | "bot";
}
interface MessageContent {
    type: "text" | "tool";
}
interface TextContent extends MessageContent {
    type: "text";
    text: string;
}
interface ToolContent extends MessageContent {
    type: "tool";
    toolName: string;
    toolArgs: Record<string, any>;
    isActive?: boolean;
}

const newMessage = ref("");
const messages = ref<Message[]>([]);
const isLoading = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

const scrollToBottom = () => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop =
                messagesContainer.value.scrollHeight;
        }
    });
};

const loadHistory = () => {
    const historyFromService = chatHistoryManager.getChatHistory();
    messages.value = historyFromService.map((msg) => ({
        sender: isHumanMessage(msg) ? "user" : "bot",
        content: [
            {
                type: "text" as const,
                text:
                    typeof msg.content === "string"
                        ? msg.content
                        : JSON.stringify(msg.content),
            },
        ],
    }));
    scrollToBottom();
};

onMounted(() => {
    loadHistory();
});

const sendMessage = async () => {
    const text = newMessage.value.trim();
    if (!text || isLoading.value) return;
    messages.value.push({
        content: [{ type: "text", text } as TextContent],
        sender: "user",
    });
    newMessage.value = "";
    isLoading.value = true;
    scrollToBottom();

    // Add an empty bot message that we'll update as we stream
    const botMessageIndex = messages.value.length;
    messages.value.push({
        content: [],
        sender: "bot",
    });
    try {
        for await (const streamEventData of sendMessageToBotStream(text)) {
            // Update message with stream data
            const botMessage = messages.value[botMessageIndex];

            if (streamEventData.type === "chat_model_stream") {
                const chunk = (streamEventData as ChatModelStreamEventData)
                    .chunk;
                const lastContent =
                    botMessage.content[botMessage.content.length - 1];
                if (lastContent !== undefined && lastContent.type === "text") {
                    (lastContent as TextContent).text += chunk;
                } else {
                    botMessage.content.push({
                        type: "text",
                        text: chunk,
                    } as TextContent);
                }
            }
            if (streamEventData.type === "tool_call") {
                const toolName = (streamEventData as ToolCallEventData)
                    .toolName;
                botMessage.content.push({
                    type: "tool",
                    toolName: toolName,
                    toolArgs: {
                        arg1: "value1", // Example argument, replace with actual args
                        arg2: "value2", // Example argument, replace with actual args
                    },
                    isActive: true,
                } as ToolContent);
            }
            if (streamEventData.type === "tool_end") {
                const toolName = (streamEventData as ToolEndEventData).toolName;
                const toolContent = botMessage.content.find(
                    (c) =>
                        c.type === "tool" &&
                        (c as ToolContent).toolName === toolName &&
                        (c as ToolContent).isActive
                ) as ToolContent | undefined;
                if (toolContent) {
                    toolContent.isActive = false;
                } else {
                    console.error(
                        `Active tool content for ${toolName} not found in message.`
                    );
                }
            }

            scrollToBottom();
        }
    } catch (error) {
        const botMessage = messages.value[botMessageIndex];
        const textContent = botMessage.content.find(
            (c) => c.type === "text"
        ) as TextContent;
        if (textContent) {
            textContent.text = "Error getting response from bot.";
        }
        console.error("Error sending message:", error);
    }

    isLoading.value = false;
    scrollToBottom();
};

const resetChat = () => {
    chatHistoryManager.clearHistory();
    messages.value = [];
    scrollToBottom();
};

const noEmptyMessages = computed(() => {
    return messages.value.filter((msg) => msg.content.length > 0);
});
</script>

<template>
    <div class="chat-container">
        <div class="chat-header">
            <button @click="resetChat" class="new-chat-button">New Chat</button>
        </div>
        <div class="messages" ref="messagesContainer">
            <div
                v-for="(msg, index) in noEmptyMessages"
                :key="index"
                :class="['message', msg.sender]"
            >
                <div
                    v-for="(content, contentIndex) in msg.content"
                    :key="`${index}-${contentIndex}`"
                >
                    <!-- Display active tools -->
                    <div
                        v-if="content.type === 'tool' && (content as ToolContent).isActive"
                        class="tool-indicator active"
                    >
                        <span class="tool-spinner"></span>
                        Using tool: {{ (content as ToolContent).toolName }}
                    </div>

                    <!-- Display completed tools -->
                    <div
                        v-if="content.type === 'tool' && !(content as ToolContent).isActive"
                        class="tool-indicator completed"
                    >
                        ✓ Completed: {{ (content as ToolContent).toolName }}
                    </div>

                    <!-- Display text content -->
                    <div
                        v-if="content.type === 'text'"
                        v-html="renderMarkdown((content as TextContent).text)"
                    ></div>
                </div>
            </div>
            <div v-if="isLoading" class="message bot typing">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
        <div class="input-area">
            <input
                type="text"
                v-model="newMessage"
                placeholder="Type your message..."
                @keypress.enter="sendMessage"
            />
            <button @click="sendMessage" :disabled="isLoading">Send</button>
        </div>
    </div>
</template>

<style scoped>
.chat-container {
    display: flex;
    flex-direction: column;
    border: 1px solid #ccc;
    border-radius: 8px;
    overflow: hidden;
    background-color: #f9f9f9;
}

/* Add styles for the header */
.chat-header {
    padding: 10px;
    background-color: #eee;
    border-bottom: 1px solid #ccc;
    display: flex;
    justify-content: flex-end; /* Align button to the right */
}

/* Add styles for the new chat button */
.new-chat-button {
    padding: 5px 15px;
    border: none;
    background-color: #6c757d; /* Grey color */
    color: white;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.new-chat-button:hover {
    background-color: #5a6268;
}

.messages {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.message {
    padding: 8px 12px;
    margin-bottom: 8px;
    border-radius: 10px;
    max-width: 80%;
    word-wrap: break-word; /* Ensure long messages wrap */
}

.message.user {
    background-color: #dcf8c6; /* Light green for user */
    align-self: flex-end;
    margin-left: auto; /* Push user messages to the right */
}

.message.bot {
    background-color: #e5e5ea; /* Light grey for bot */
    align-self: flex-start;
    margin-right: auto; /* Push bot messages to the left */
}

.input-area {
    display: flex;
    padding: 10px;
    border-top: 1px solid #ccc;
    background-color: #fff;
}

.input-area input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 20px;
    font-size: 1rem;
}

.input-area button {
    padding: 10px 20px;
    border: none;
    background-color: #007bff;
    color: white;
    border-radius: 20px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    margin-left: 0; /* Remove margin as reset button is gone */
}

.input-area button:hover {
    background-color: #0056b3;
}

.input-area button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.chat-messages {
    display: flex;
    flex-direction: column;
}

.typing {
    font-style: italic;
    color: #888;
}

/* Tool indicator styles */
.tool-indicator {
    font-size: 0.85em;
    padding: 4px 8px;
    margin-bottom: 6px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.tool-indicator.active {
    background-color: #fff3cd;
    color: #856404;
    border: 1px solid #ffeaa7;
}

.tool-indicator.completed {
    background-color: #d1edff;
    color: #0c5460;
    border: 1px solid #b8daff;
}

.tool-spinner {
    width: 12px;
    height: 12px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #856404;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

/* Typing indicator styles */
.typing-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
}

.typing-indicator span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #999;
    animation: bounce 1.4s ease-in-out infinite both;
}

.typing-indicator span:nth-child(1) {
    animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
    animation-delay: -0.16s;
}

@keyframes bounce {
    0%,
    80%,
    100% {
        transform: scale(0);
    }
    40% {
        transform: scale(1);
    }
}

/* Add styles for rendered markdown elements if needed */
.message :deep(p) {
    margin: 0 0 0.5em 0; /* Adjust paragraph spacing within messages */
}
.message :deep(ul),
.message :deep(ol) {
    padding-left: 20px;
    margin-bottom: 0.5em;
}
.message :deep(li) {
    margin-bottom: 0.2em;
}
.message :deep(code) {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: monospace;
}
.message :deep(pre) {
    background-color: rgba(0, 0, 0, 0.07);
    padding: 10px;
    border-radius: 5px;
    overflow-x: auto;
}
.message :deep(pre) code {
    background-color: transparent;
    padding: 0;
}
.message :deep(a) {
    color: #007bff;
    text-decoration: underline;
}
.message :deep(blockquote) {
    border-left: 3px solid #ccc;
    padding-left: 10px;
    margin-left: 0;
    color: #555;
}
</style>
