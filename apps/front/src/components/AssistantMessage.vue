<script lang="ts" setup>
import type { ChatMessage } from "@mealplanner/shared-all";
import ChatRecipeCard from "./ChatRecipeCard.vue";
import MarkdownRenderer from "./MarkdownRenderer.vue";
import ToolStatus from "./ToolStatus.vue";

interface Props {
    message: ChatMessage; // isUser should be false
}

defineProps<Props>();
</script>

<template>
    <div class="assistant">
        <div class="content">
            <template v-for="(part, idx) in message.parts" :key="idx">
                <div v-if="part.type === 'text'" class="text-part">
                    <MarkdownRenderer>{{ part.content }}</MarkdownRenderer>
                    <span v-if="part.isStreaming" class="cursor">|</span>
                </div>
                <ToolStatus
                    v-else-if="part.type === 'tool'"
                    class="tool-part"
                    :name="part.toolName"
                    :status="part.status"
                />
                <ChatRecipeCard
                    v-else-if="part.type === 'recipeCard'"
                    :recipe="part.recipe"
                />
            </template>
        </div>
    </div>
</template>

<style scoped>
.assistant {
    /* Full width like ChatGPT */
    display: block;
    padding: 8px 16px;
}

.content {
    /* No bubble background for assistant */
    max-width: 800px;
    margin: 0 auto; /* center on larger screens */
}

.text-part {
    color: var(--text-primary);
    white-space: pre-wrap;
    line-height: 1.6;
    font-size: 16px;
}

.tool-part {
    margin: 10px 0;
}

.cursor {
    animation: blink 1s infinite;
    font-weight: bold;
    margin-left: 2px;
}

@keyframes blink {
    50% {
        opacity: 0;
    }
}
</style>
