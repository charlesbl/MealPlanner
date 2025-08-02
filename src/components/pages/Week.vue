<script lang="ts" setup>
import { computed } from "vue";
import { MealType } from "../../stores/mealStore";
import { useWeekStore } from "../../stores/weekStore";
import MealCard from "../MealCard.vue";

const weekStore = useWeekStore();

const selectedMeals = computed(() => weekStore.getSelectedMealsWithData());
const mealsByType = computed(() => weekStore.selectedMealsByType());

// Define meal types in a preferred order
const mealTypeOrder = [
    MealType.Breakfast,
    MealType.Lunch,
    MealType.Dinner,
    MealType.Snacks,
];

const getMealTypeLabel = (mealType: MealType): string => {
    const labels = {
        [MealType.Breakfast]: "Petit-déjeuner",
        [MealType.Lunch]: "Déjeuner",
        [MealType.Dinner]: "Dîner",
        [MealType.Snacks]: "Collations",
    };
    return labels[mealType] || mealType;
};
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
            <div
                v-for="mealType in mealTypeOrder"
                :key="mealType"
                v-show="mealsByType[mealType] && mealsByType[mealType]!.length > 0"
                class="meal-type-section"
            >
                <h2 class="meal-type-title">
                    {{ getMealTypeLabel(mealType) }}
                </h2>
                <div class="meals-list">
                    <MealCard
                        v-for="meal in mealsByType[mealType]"
                        :key="meal.weekMealId"
                        :meal="meal"
                    />
                </div>
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
    gap: 24px;
}

.meal-type-section {
    background-color: var(--bg-secondary, #f8f9fa);
    border-radius: 12px;
    padding: 16px;
    border: 1px solid var(--border-light, #e0e0e0);
}

.meal-type-title {
    margin: 0 0 16px 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    padding-bottom: 8px;
    border-bottom: 2px solid var(--border-accent, #e0e0e0);
}

.meals-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
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

    .meal-type-section {
        padding: 20px;
    }

    .meal-type-title {
        font-size: 1.2rem;
    }

    .meals-list {
        gap: 12px;
    }
}

/* Desktop screens */
@media (min-width: 1024px) {
    .week-container {
        padding: 32px;
        max-width: 1200px;
        margin: 0 auto;
    }

    .week-content {
        gap: 32px;
    }

    .meal-type-section {
        padding: 24px;
    }
}
</style>
