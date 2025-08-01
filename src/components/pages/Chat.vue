<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from "vue";
import ChatInput from "../ChatInput.vue";

const chatInputRef = ref<InstanceType<typeof ChatInput>>();
const inputAreaHeight = ref(10); // Default height

const updateInputAreaHeight = () => {
    if (chatInputRef.value?.$el) {
        const height = chatInputRef.value.$el.offsetHeight;
        inputAreaHeight.value = height;
    }
};

const handleSendMessage = (message: string) => {
    console.log("Message sent:", message);
    // TODO: Implement message sending logic
};

onMounted(() => {
    // Update height after component is mounted
    updateInputAreaHeight();

    // Watch for window resize events that might affect the input area
    window.addEventListener("resize", updateInputAreaHeight);
});

onUnmounted(() => {
    window.removeEventListener("resize", updateInputAreaHeight);
});
</script>

<template>
    <div class="chat-container">
        <div
            class="messages"
            :style="{ paddingBottom: `${inputAreaHeight}px` }"
        >
            <div v-for="value in 50" :key="value">message {{ value }}</div>
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
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
.messages {
    height: 100dvh;
    overflow-y: auto;
    background-color: lightgreen;
}
.chat-input {
    height: 0;
    overflow: visible;
    position: relative;
    left: 0;
    /* TODO change position it if the keyboard is open */
    bottom: 500px;
}
</style>
