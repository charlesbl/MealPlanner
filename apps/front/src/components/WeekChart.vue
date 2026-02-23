<script setup lang="ts">
import type { NutritionInfo } from "@mealplanner/shared-all";
import { computed } from "vue";

const props = defineProps<{
    days: { date: string; totals: NutritionInfo }[];
    activeDate: string;
    calorieGoal: number;
}>();

const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

const bars = computed(() =>
    props.days.map((d, i) => ({
        label: DAY_LABELS[i] ?? "?",
        pct:
            props.calorieGoal > 0
                ? Math.min((d.totals.calories / props.calorieGoal) * 100, 100)
                : 0,
        isActive: d.date === props.activeDate,
        hasData: d.totals.calories > 0,
    })),
);
</script>

<template>
    <div class="week-chart">
        <div v-for="(bar, i) in bars" :key="i" class="bar-col">
            <div class="bar-track">
                <div
                    class="bar-fill"
                    :class="
                        bar.isActive
                            ? 'bar-active'
                            : bar.hasData
                              ? 'bar-past'
                              : 'bar-empty'
                    "
                    :style="`height: ${bar.pct}%`"
                />
            </div>
            <span
                class="bar-label"
                :class="bar.isActive ? 'label-active' : 'label-muted'"
            >
                {{ bar.label }}
            </span>
        </div>
    </div>
</template>

<style scoped>
.week-chart {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 4px;
    height: 64px;
    padding: 0 4px;
}

.bar-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    flex: 1;
}

.bar-track {
    flex: 1;
    width: 100%;
    background: var(--color-border);
    border-radius: 3px;
    display: flex;
    align-items: flex-end;
    overflow: hidden;
    min-height: 0;
}

.bar-fill {
    width: 100%;
    border-radius: 3px;
    transition: height 0.3s ease;
    min-height: 2px;
}

.bar-active {
    background: var(--color-accent);
}

.bar-past {
    background: #444444;
}

.bar-empty {
    background: transparent;
    min-height: 0;
}

.bar-label {
    font-size: 10px;
    line-height: 1;
    flex-shrink: 0;
}

.label-active {
    color: var(--color-accent);
}

.label-muted {
    color: var(--color-muted);
}
</style>
