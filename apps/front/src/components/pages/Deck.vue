<script lang="ts" setup>
import { computed } from "vue";
import { useMealStore } from "../../stores/mealStore";
import MealCard from "../MealCard.vue";

const mealStore = useMealStore();

const sortedMeals = computed(() =>
    mealStore.meals.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )
);

function handleDeleteMeal(mealId: string) {
    const success = mealStore.deleteMeal(mealId);
    if (!success) {
        console.error("Failed to delete meal");
    }
}
</script>

<template>
    <div class="deck-container">
        <div class="deck-header">
            <h1>Mes Repas</h1>
            <p class="meal-count">{{ sortedMeals.length }} repas enregistrés</p>
        </div>
        <div class="meals-list" v-if="sortedMeals.length > 0">
            <MealCard
                v-for="meal in sortedMeals"
                :key="meal.id"
                :meal="meal"
                @delete="handleDeleteMeal"
            />
        </div>

        <div class="empty-state" v-else>
            <p>Aucun repas enregistré pour le moment.</p>
            <p class="empty-hint">
                Utilisez le chat pour ajouter vos premiers repas !
            </p>
        </div>
    </div>
</template>

<style scoped>
.deck-container {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    height: 100%;
    padding: 16px;
    overflow-y: auto;
}

.deck-header {
    margin-bottom: 24px;
}

.deck-header h1 {
    margin: 0 0 8px 0;
    font-size: 1.5rem;
    font-weight: 700;
}

.meal-count {
    margin: 0;
    color: var(--text-secondary, #666);
    font-size: 0.9rem;
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
    .deck-container {
        padding: 24px;
    }

    .deck-header h1 {
        font-size: 2rem;
    }

    .meals-list {
        gap: 12px;
    }
}

/* Desktop screens */
@media (min-width: 1024px) {
    .deck-container {
        padding: 32px;
        max-width: 1200px;
        margin: 0 auto;
    }
}
</style>
