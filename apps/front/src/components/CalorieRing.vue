<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
    consumed: number;
    goal: number;
    size?: number;
}>();

const R = 50;
const C = 2 * Math.PI * R; // ≈ 314.16

const clampedPct = computed(() =>
    props.goal > 0 ? Math.min(props.consumed / props.goal, 1) : 0,
);

const arc = computed(() => clampedPct.value * C);
const gap = computed(() => C - arc.value);
const isOver = computed(() => props.goal > 0 && props.consumed > props.goal);

const displaySize = computed(() => props.size ?? 160);
</script>

<template>
    <div
        class="calorie-ring-wrapper"
        :style="`width:${displaySize}px;height:${displaySize}px`"
    >
        <!-- -rotate-90 so arc starts at 12 o'clock -->
        <svg
            :viewBox="`0 0 120 120`"
            class="ring-svg"
            style="transform: rotate(-90deg)"
        >
            <!-- Track -->
            <circle
                cx="60"
                cy="60"
                :r="R"
                fill="none"
                stroke="var(--color-border)"
                stroke-width="8"
            />
            <!-- Arc -->
            <circle
                cx="60"
                cy="60"
                :r="R"
                fill="none"
                :stroke="isOver ? '#f87171' : 'var(--color-accent)'"
                stroke-width="8"
                stroke-linecap="round"
                :stroke-dasharray="`${arc} ${gap}`"
            />
        </svg>
        <!-- Center text -->
        <div class="ring-center">
            <span class="ring-value">{{ consumed }}</span>
            <span class="ring-goal">/ {{ goal }} kcal</span>
        </div>
    </div>
</template>

<style scoped>
.calorie-ring-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.ring-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
}

.ring-center {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
}

.ring-value {
    font-size: 28px;
    font-weight: 600;
    color: var(--color-text);
    line-height: 1;
}

.ring-goal {
    font-size: 11px;
    color: var(--color-muted);
    line-height: 1;
}
</style>
