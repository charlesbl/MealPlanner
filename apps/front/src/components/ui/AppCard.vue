<template>
    <div
        :class="[
            'bg-surface border border-border rounded-[6px]',
            noPadding ? '' : 'p-4',
        ]"
    >
        <slot />
    </div>
</template>

<script setup lang="ts">
defineProps<{
    noPadding?: boolean;
}>();
</script>
