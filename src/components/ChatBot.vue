<script setup lang="ts">
import { ref, nextTick, onMounted } from "vue";
import {
  sendMessageToBot,
  getChatHistory,
  clearChatHistory,
} from "@/services/chatService"; // Import clearChatHistory
import { renderMarkdown } from "@/utils/markdown"; // Import from utility

interface Message {
  text: string;
  sender: "user" | "bot";
}

const newMessage = ref("");
const messages = ref<Message[]>([]);
const isLoading = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const loadHistory = () => {
  const historyFromService = getChatHistory();
  messages.value = historyFromService.map((msg) => ({
    // Assuming HumanMessage maps to 'user' and AIMessage maps to 'bot'
    // You might need to import HumanMessage/AIMessage to check instanceof
    // or rely on the simplified structure saved in localStorage if that's easier
    sender: msg._getType() === "human" ? "user" : "bot",
    text:
      typeof msg.content === "string"
        ? msg.content
        : JSON.stringify(msg.content), // Ensure text is string
  }));
  // Add a welcome message if history is empty
  if (messages.value.length === 0) {
    messages.value.push({
      text: "Welcome! How can I help you plan your meals?",
      sender: "bot",
    });
  }
  scrollToBottom(); // Scroll after loading
};

onMounted(() => {
  loadHistory(); 
});

const sendMessage = async () => {
  const text = newMessage.value.trim();
  if (!text || isLoading.value) return;

  // Add user message
  messages.value.push({ text, sender: "user" });
  newMessage.value = "";
  isLoading.value = true;
  scrollToBottom();

  // Get bot response
  try {
    const botResponse = await sendMessageToBot(text);
    messages.value.push({ text: botResponse, sender: "bot" });
  } catch (error) {
    messages.value.push({
      text: "Error getting response from bot.",
      sender: "bot",
    });
    console.error("Error sending message:", error);
  }

  isLoading.value = false;
  scrollToBottom();
};

// Initial scroll to bottom
nextTick(scrollToBottom);

const resetChat = () => {
  clearChatHistory(); // Clear history in service and local storage
  messages.value = []; // Clear messages in the component
  // Add a starting message after reset
  messages.value.push({
    text: "New chat started. How can I help you plan your meals?",
    sender: "bot",
  });
  scrollToBottom(); // Scroll after resetting
};
</script>

<template>
  <div class="chat-container">
    <div class="chat-header">
      <!-- Add header div -->
      <button @click="resetChat" class="new-chat-button">New Chat</button>
      <!-- Move and rename button -->
    </div>
    <div class="messages" ref="messagesContainer">
      <!-- Use v-html to render Markdown -->
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['message', msg.sender]"
      >
        <div v-html="renderMarkdown(msg.text)"></div>
      </div>
      <div v-if="isLoading" class="message bot typing">...</div>
    </div>
    <div class="input-area">
      <input
        type="text"
        v-model="newMessage"
        placeholder="Type your message..."
        @keypress.enter="sendMessage"
      />
      <button @click="sendMessage" :disabled="isLoading">Send</button>
      <!-- Removed reset button from here -->
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
