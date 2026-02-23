<template>
    <button
        role="switch"
        :aria-checked="modelValue"
        @click="$emit('update:modelValue', !modelValue)"
        :class="[
            'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-border transition-colors',
            modelValue ? 'bg-accent/20' : 'bg-surface',
        ]"
    >
        <span
            :class="[
                'pointer-events-none inline-block h-3.5 w-3.5 rounded-full shadow transition-transform mt-[2px]',
                modelValue
                    ? 'translate-x-[18px] bg-accent'
                    : 'translate-x-[2px] bg-muted',
            ]"
        />
    </button>
</template>

<script setup lang="ts">
defineProps<{
    modelValue?: boolean;
}>();

defineEmits<{
    "update:modelValue": [value: boolean];
}>();
</script>
