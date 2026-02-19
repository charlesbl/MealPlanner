<template>
    <input
        :value="modelValue"
        :placeholder="placeholder"
        @input="
            $emit(
                'update:modelValue',
                ($event.target as HTMLInputElement).value,
            )
        "
        class="w-full bg-surface border border-border rounded-[4px] px-3 py-2 text-sm text-text placeholder:text-muted outline-none focus:border-accent transition-colors"
        v-bind="$attrs"
    />
</template>

<script setup lang="ts">
defineProps<{
    modelValue?: string;
    placeholder?: string;
}>();

defineEmits<{
    "update:modelValue": [value: string];
}>();
</script>
