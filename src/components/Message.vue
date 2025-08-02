<script lang="ts" setup>
import { renderMarkdown } from "@/utils/markdown";
import { computed } from "vue";

interface Props {
    content: string;
    isUser: boolean;
    isStreaming?: boolean;
}

const props = defineProps<Props>();

const renderedContent = computed(() => {
    if (props.isUser) {
        // For user messages, return plain text to avoid rendering markdown
        return props.content;
    }
    // For bot messages, render markdown
    return renderMarkdown(props.content);
});
</script>

<template>
    <div
        class="message"
        :class="{ 'user-message': isUser, 'bot-message': !isUser }"
    >
        <div class="message-content">
            <div class="message-text">
                <span v-if="isUser" class="message-plain-text">{{
                    content
                }}</span>
                <div
                    v-else
                    class="message-markdown"
                    v-html="renderedContent"
                ></div>
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
    background-color: #007bff;
    color: white;
    border-bottom-right-radius: 6px;
}

.bot-message .message-text {
    background-color: #f1f3f4;
    color: #333;
    border-bottom-left-radius: 6px;
}

.streaming-indicator {
    animation: blink 1s infinite;
    font-weight: bold;
}

.message-plain-text,
.message-markdown {
    display: inline;
}

/* Markdown content styles for bot messages */
.bot-message .message-markdown :deep(p) {
    margin: 0.5em 0;
}

.bot-message .message-markdown :deep(p:first-child) {
    margin-top: 0;
}

.bot-message .message-markdown :deep(p:last-child) {
    margin-bottom: 0;
}

.bot-message .message-markdown :deep(h1),
.bot-message .message-markdown :deep(h2),
.bot-message .message-markdown :deep(h3),
.bot-message .message-markdown :deep(h4),
.bot-message .message-markdown :deep(h5),
.bot-message .message-markdown :deep(h6) {
    margin: 0.75em 0 0.5em 0;
    font-weight: 600;
}

.bot-message .message-markdown :deep(h1:first-child),
.bot-message .message-markdown :deep(h2:first-child),
.bot-message .message-markdown :deep(h3:first-child),
.bot-message .message-markdown :deep(h4:first-child),
.bot-message .message-markdown :deep(h5:first-child),
.bot-message .message-markdown :deep(h6:first-child) {
    margin-top: 0;
}

.bot-message .message-markdown :deep(ul),
.bot-message .message-markdown :deep(ol) {
    margin: 0.5em 0;
    padding-left: 1.5em;
}

.bot-message .message-markdown :deep(li) {
    margin: 0.25em 0;
}

.bot-message .message-markdown :deep(code) {
    background-color: rgba(0, 0, 0, 0.1);
    padding: 0.125em 0.25em;
    border-radius: 3px;
    font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
    font-size: 0.9em;
}

.bot-message .message-markdown :deep(pre) {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 0.75em;
    border-radius: 6px;
    overflow-x: auto;
    margin: 0.5em 0;
}

.bot-message .message-markdown :deep(pre code) {
    background-color: transparent;
    padding: 0;
}

.bot-message .message-markdown :deep(blockquote) {
    border-left: 3px solid #ddd;
    margin: 0.5em 0;
    padding-left: 1em;
    color: #666;
}

.bot-message .message-markdown :deep(strong),
.bot-message .message-markdown :deep(b) {
    font-weight: 600;
}

.bot-message .message-markdown :deep(em),
.bot-message .message-markdown :deep(i) {
    font-style: italic;
}

.bot-message .message-markdown :deep(a) {
    color: #007bff;
    text-decoration: underline;
}

.bot-message .message-markdown :deep(a:hover) {
    color: #0056b3;
}

@keyframes blink {
    0%,
    50% {
        opacity: 1;
    }
    51%,
    100% {
        opacity: 0;
    }
}
</style>
