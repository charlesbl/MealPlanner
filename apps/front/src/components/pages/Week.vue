<script lang="ts" setup>
import { computed } from "vue";
import { useWeekStore } from "../../stores/weekStore";
import MealCard from "../MealCard.vue";

const weekStore = useWeekStore();

const selectedMeals = computed(() => weekStore.getSelectedMealsWithData());

function handleRemoveMealFromWeek(mealId: string, weekMealId?: string) {
    const success = weekMealId
        ? weekStore.removeWeekMealById(weekMealId)
        : weekStore.removeMealFromWeek(mealId);

    if (!success) {
        console.error("Failed to remove meal from week");
    }
}
</script>

<template>
    <div class="week-container">
        <div class="week-header">
            <h1>Ma Semaine</h1>
            <p class="meal-count">
                {{ selectedMeals.length }} repas sélectionnés
            </p>
        </div>

        <div class="week-content" v-if="selectedMeals.length > 0">
            <div class="meals-list">
                <MealCard
                    v-for="meal in selectedMeals"
                    :key="meal.weekMealId"
                    :meal="meal"
                    @delete="handleRemoveMealFromWeek"
                />
            </div>
        </div>

        <div class="empty-state" v-else>
            <p>Aucun repas sélectionné pour la semaine.</p>
            <p class="empty-hint">
                Utilisez le chat pour ajouter des repas à votre semaine !
            </p>
        </div>
    </div>
</template>

<style scoped>
.week-container {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    height: 100%;
    padding: 16px;
    overflow-y: auto;
}

.week-header {
    margin-bottom: 24px;
}

.week-header h1 {
    margin: 0 0 8px 0;
    font-size: 1.5rem;
    font-weight: 700;
}

.meal-count {
    margin: 0;
    color: var(--text-secondary, #666);
    font-size: 0.9rem;
}

.week-content {
    display: flex;
    flex-direction: column;
}

.meals-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.empty-state {
    text-align: center;
    margin-top: 60px;
    padding: 20px;
}

.empty-state p {
    margin: 0 0 8px 0;
    color: var(--text-secondary, #666);
}

.empty-hint {
    font-size: 0.9rem;
    color: var(--text-tertiary, #999);
}

/* Tablet and larger screens */
@media (min-width: 768px) {
    .week-container {
        padding: 24px;
    }

    .week-header h1 {
        font-size: 2rem;
    }

    .meals-list {
        gap: 16px;
    }
}

/* Desktop screens */
@media (min-width: 1024px) {
    .week-container {
        padding: 32px;
        max-width: 1200px;
        margin: 0 auto;
    }

    .meals-list {
        gap: 20px;
    }
}
</style>
