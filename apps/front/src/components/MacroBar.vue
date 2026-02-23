<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
    label: string;
    current: number;
    goal?: number | null;
    compact?: boolean;
}>();

const pct = computed(() => {
    if (!props.goal) return 0;
    return Math.min((props.current / props.goal) * 100, 100);
});

const isOver = computed(() => !!props.goal && props.current > props.goal);
</script>

<template>
    <!-- Compact: value on top, small bar below (Dashboard) -->
    <div v-if="compact" class="macro-compact">
        <div class="compact-bar-track">
            <div
                class="compact-bar-fill"
                :class="isOver ? 'bar-over' : ''"
                :style="`width: ${pct}%`"
            />
        </div>
        <span class="compact-value">{{ current }}<template v-if="goal"> / {{ goal }}</template>g</span>
        <span class="compact-label">{{ label }}</span>
    </div>

    <!-- Full: label + value on same line, full-width bar below (Journal) -->
    <div v-else class="macro-full">
        <div class="full-header">
            <span class="full-label">{{ label }}</span>
            <span class="full-value">{{ current }}<template v-if="goal"> / {{ goal }}</template> g</span>
        </div>
        <div class="full-bar-track">
            <div
                class="full-bar-fill"
                :class="isOver ? 'bar-over' : ''"
                :style="`width: ${pct}%`"
            />
        </div>
    </div>
</template>

<style scoped>
/* Compact (Dashboard) */
.macro-compact {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    flex: 1;
}

.compact-bar-track {
    width: 100%;
    height: 3px;
    background: var(--color-border);
    border-radius: 999px;
    overflow: hidden;
}

.compact-bar-fill {
    height: 100%;
    background: var(--color-accent);
    border-radius: 999px;
    transition: width 0.3s ease;
}

.compact-value {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-accent);
    line-height: 1;
}

.compact-label {
    font-size: 10px;
    color: var(--color-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

/* Full (Journal) */
.macro-full {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.full-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
}

.full-label {
    font-size: 11px;
    color: var(--color-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
}

.full-value {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text);
}

.full-bar-track {
    width: 100%;
    height: 4px;
    background: var(--color-border);
    border-radius: 999px;
    overflow: hidden;
}

.full-bar-fill {
    height: 100%;
    background: var(--color-accent);
    border-radius: 999px;
    transition: width 0.3s ease;
}

.bar-over {
    background: #f87171;
}
</style>
