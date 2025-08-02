<script lang="ts" setup>
import { ref } from "vue";
import ChatInput from "../ChatInput.vue";

const messagesCount = ref(50);

const handleSendMessage = (message: string) => {
    console.log("Message sent:", message);
    // TODO: Implement message sending logic
    messagesCount.value += 1;
};
</script>

<template>
    <div class="chat-container">
        <div class="messages">
            <div v-for="value in messagesCount" :key="value">
                message {{ value }}
            </div>
        </div>
        <ChatInput
            ref="chatInputRef"
            class="chat-input"
            @send-message="handleSendMessage"
        />
    </div>
</template>

<style scoped>
.chat-container {
    background-color: green;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100dvh;
}

.messages {
    overflow-y: auto;
    background-color: lightgreen;
    transition: height 0.3s ease-in-out;
    flex-grow: 1;
}

.chat-input {
    flex-shrink: 0;
}
</style>
