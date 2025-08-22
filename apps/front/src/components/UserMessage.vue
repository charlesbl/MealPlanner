<script lang="ts" setup>
import type { ChatMessage } from "@mealplanner/shared-all";
import MarkdownRenderer from "./MarkdownRenderer.vue";

interface Props {
    message: ChatMessage; // isUser should be true, single text part
}

defineProps<Props>();
</script>

<template>
    <div class="user">
        <div class="bubble">
            <MarkdownRenderer>
                {{
                    message.parts[0]?.type === "text"
                        ? message.parts[0]?.content
                        : ""
                }}
            </MarkdownRenderer>
        </div>
    </div>
</template>

<style scoped>
.user {
    display: flex;
    justify-content: flex-end;
    padding: 8px 16px;
}

.bubble {
    max-width: 80%;
    background: var(--accent-blue);
    color: var(--bg-primary);
    border-radius: 18px;
    border-bottom-right-radius: 6px;
    padding: 12px 16px;
    font-size: 16px;
    line-height: 1.4;
}
</style>
