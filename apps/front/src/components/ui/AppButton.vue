<template>
    <button
        :class="[
            'inline-flex items-center justify-center gap-1.5 text-sm font-medium cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-40 disabled:cursor-not-allowed',
            variantClasses,
        ]"
        v-bind="$attrs"
    >
        <slot />
    </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
    variant?: "ghost" | "muted" | "danger";
}>();

const variantClasses = computed(() => {
    switch (props.variant) {
        case "ghost":
            return "border border-border text-accent bg-transparent px-3 py-1.5 rounded-[4px]";
        case "muted":
            return "text-muted bg-transparent px-3 py-1.5";
        case "danger":
            return "text-red-400 bg-transparent px-3 py-1.5";
        default:
            return "border border-border text-accent bg-transparent px-3 py-1.5 rounded-[4px]";
    }
});
</script>
