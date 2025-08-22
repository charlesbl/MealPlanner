<script lang="ts" setup>
import MarkdownRenderer from "./MarkdownRenderer.vue";

interface Props {
    content: string;
    isUser: boolean;
    isStreaming?: boolean;
}

defineProps<Props>();
</script>

<template>
    <div
        class="message"
        :class="{ 'user-message': isUser, 'bot-message': !isUser }"
    >
        <div class="message-content">
            <div class="message-text">
                <MarkdownRenderer>{{ content }}</MarkdownRenderer>
                <span v-if="isStreaming" class="streaming-indicator">|</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.message {
    margin-bottom: 12px;
    padding: 0 16px;
    display: flex;
}

.user-message {
    justify-content: flex-end;
}

.bot-message {
    justify-content: flex-start;
}

.message-content {
    max-width: 80%;
    min-width: 0;
}

.message-text {
    padding: 12px 16px;
    border-radius: 18px;
    word-wrap: break-word;
    white-space: pre-wrap;
    font-size: 16px;
    line-height: 1.4;
}

.user-message .message-text {
    background-color: var(--accent-blue);
    color: var(--bg-primary);
    border-bottom-right-radius: 6px;
}

.bot-message .message-text {
    background-color: var(--chat-bot-bg);
    color: var(--text-primary);
    border-bottom-left-radius: 6px;
}

.streaming-indicator {
    animation: blink 1s infinite;
    font-weight: bold;
}
</style>
