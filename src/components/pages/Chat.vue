<script lang="ts" setup>
import ChatInput from "../ChatInput.vue";

const handleSendMessage = (message: string) => {
    console.log("Message sent:", message);
    // TODO: Implement message sending logic
};
</script>

<template>
    <div class="chat-container">
        <div class="messages">
            <div v-for="value in 5" :key="value">message {{ value }}</div>
        </div>
        <ChatInput class="chat-input" @send-message="handleSendMessage" />
    </div>
</template>

<style scoped>
.chat-container {
    background-color: green;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
.messages {
    overflow-y: auto;
    padding-bottom: 80px; /* Adjust based on ChatInput height */
}
.chat-input {
    position: absolute;
    left: 0;
    bottom: 16px;
}
</style>
