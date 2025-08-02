<script lang="ts" setup>
import { ref } from "vue";

const message = ref("");

const emit = defineEmits<{
    sendMessage: [message: string];
}>();

const sendMessage = () => {
    emit("sendMessage", message.value.trim());
    message.value = "";
};

const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
};
</script>

<template>
    <div class="input-area-wrapper">
        <div class="input-area">
            <input
                v-model="message"
                type="text"
                placeholder="Type a message..."
                @keydown="handleKeydown"
            />
            <button @click="sendMessage">Send</button>
        </div>
    </div>
</template>

<style scoped>
.input-area-wrapper {
    width: 100%;
}
.input-area {
    display: flex;
    gap: 8px;
    padding: 8px;
    /* background-color: #f8f9fa; */
}

.input-area-wrapper input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid #ddd;
    border-radius: 24px;
    font-size: 16px;
    outline: none;
    transition: border-color 0.2s ease;
}

.input-area-wrapper input:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.input-area-wrapper button {
    padding: 12px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 24px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 60px;
}

.input-area-wrapper button:hover:not(:disabled) {
    background-color: #0056b3;
}

.input-area-wrapper button:active:not(:disabled) {
    transform: scale(0.98);
}

.input-area-wrapper button:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
    opacity: 0.6;
}
</style>
