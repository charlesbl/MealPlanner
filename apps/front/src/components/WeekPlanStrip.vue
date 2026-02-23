<script setup lang="ts">
import type { NutritionInfo } from "@mealplanner/shared-all";
import { useRouter } from "vue-router";

const props = defineProps<{
    weekData: { date: string; totals: NutritionInfo }[];
    today: string;
}>();

const router = useRouter();

const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

function navigateToDay(date: string) {
    if (date === props.today) {
        router.push("/journal");
    } else {
        router.push(`/journal/${date}`);
    }
}
</script>

<template>
    <div class="week-strip">
        <button
            v-for="(day, i) in weekData"
            :key="day.date"
            class="day-pill"
            :class="{
                'pill-today': day.date === today,
                'pill-has-data': day.totals.calories > 0 && day.date !== today,
            }"
            @click="navigateToDay(day.date)"
        >
            <span class="day-label">{{ DAY_LABELS[i] ?? "?" }}</span>
            <span
                v-if="day.totals.calories > 0 && day.date !== today"
                class="day-dot"
            />
        </button>
    </div>
</template>

<style scoped>
.week-strip {
    display: flex;
    justify-content: space-between;
    gap: 6px;
}

.day-pill {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    flex: 1;
    aspect-ratio: 1;
    max-width: 44px;
    border-radius: 8px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    cursor: pointer;
    transition: opacity 0.15s;
    padding: 6px;
}

.day-pill:hover {
    opacity: 0.8;
}

.pill-today {
    border-color: var(--color-accent);
    background: transparent;
}

.pill-has-data {
    background: #222222;
}

.day-label {
    font-size: 11px;
    color: var(--color-text);
    font-weight: 500;
    line-height: 1;
}

.pill-today .day-label {
    color: var(--color-accent);
}

.day-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--color-accent);
}
</style>
