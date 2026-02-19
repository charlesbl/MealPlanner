<script lang="ts" setup>
import { renderMarkdown } from "@/utils/markdown";
import { computed, useSlots } from "vue";

const slots = useSlots();

const textContent = computed(() => {
    if (slots.default) {
        const slotNodes = slots.default();
        return slotNodes
            .map((node) =>
                typeof node.children === "string" ? node.children : "",
            )
            .join("");
    }
    return "";
});

const renderedContent = computed(() => renderMarkdown(textContent.value));
</script>

<template>
    <div v-html="renderedContent"></div>
</template>
