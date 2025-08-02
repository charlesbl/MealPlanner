<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from "vue";
import ChatInput from "../ChatInput.vue";

const chatInputRef = ref<InstanceType<typeof ChatInput>>();
const inputAreaHeight = ref(0);
const currentHeight = ref(window.visualViewport?.height || window.innerHeight);
const messagesCount = ref(50);

const handleSendMessage = (message: string) => {
    console.log("Message sent:", message);
    // TODO: Implement message sending logic
    messagesCount.value += 1; // Increment message count for demonstration
};

const handleViewportChange = () => {
    updateCurrentHeight();
    updateInputAreaHeight();
};

const updateInputAreaHeight = () => {
    if (chatInputRef.value?.$el) {
        const height = chatInputRef.value.$el.offsetHeight;
        inputAreaHeight.value = height;
    }
};

const updateCurrentHeight = () => {
    if (window.visualViewport) {
        currentHeight.value = window.visualViewport.height;
    } else {
        currentHeight.value = window.innerHeight;
    }
};

onMounted(() => {
    updateInputAreaHeight();

    window.addEventListener("resize", handleViewportChange);

    if ("visualViewport" in window && window.visualViewport) {
        window.visualViewport.addEventListener("resize", handleViewportChange);
        window.visualViewport.addEventListener("scroll", handleViewportChange);
    }
});

onUnmounted(() => {
    window.removeEventListener("resize", handleViewportChange);

    if ("visualViewport" in window && window.visualViewport) {
        window.visualViewport.removeEventListener(
            "resize",
            handleViewportChange
        );
        window.visualViewport.removeEventListener(
            "scroll",
            handleViewportChange
        );
    }
});
</script>

<template>
    <div class="chat-container">
        <div class="messages">
            {{ inputAreaHeight }}
            {{ currentHeight }}
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
}

.messages {
    height: v-bind(currentHeight - inputAreaHeight + "px");
    overflow-y: auto;
    background-color: lightgreen;
    transition: height 0.3s ease-in-out;
}
</style>
