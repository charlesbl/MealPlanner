<script lang="ts" setup>
import type { Meal } from "../stores/mealStore";

interface Props {
    meal: Meal;
}

defineProps<Props>();

function formatMealTypes(mealTypes: string[]): string {
    // TODO delete this
    if (typeof mealTypes === "undefined") {
        return "";
    }
    return mealTypes.join(", ");
}

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}
</script>

<template>
    <div class="meal-card">
        <div class="meal-header">
            <h3 class="meal-name">{{ meal.name }}</h3>
            <span class="meal-types">{{
                formatMealTypes(meal.mealTypes)
            }}</span>
        </div>
        <p class="meal-description">{{ meal.description }}</p>
        <div class="meal-footer">
            <span class="meal-date">{{ formatDate(meal.createdAt) }}</span>
        </div>
    </div>
</template>

<style scoped>
.meal-card {
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-light);
    border-radius: 8px;
    padding: 16px;
    margin: 8px 0;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.meal-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.meal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
    flex-wrap: wrap;
    gap: 8px;
}

.meal-name {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    flex: 1;
    min-width: 0;
}

.meal-types {
    font-size: 0.8rem;
    color: var(--text-secondary, #666);
    background-color: var(--bg-primary);
    padding: 4px 8px;
    border-radius: 12px;
    white-space: nowrap;
}

.meal-description {
    margin: 0 0 12px 0;
    line-height: 1.4;
    color: var(--text-secondary, #666);
}

.meal-footer {
    display: flex;
    justify-content: flex-end;
}

.meal-date {
    font-size: 0.8rem;
    color: var(--text-tertiary, #999);
}

/* Mobile-first responsive design */
@media (max-width: 480px) {
    .meal-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .meal-types {
        align-self: flex-start;
    }
}
</style>
