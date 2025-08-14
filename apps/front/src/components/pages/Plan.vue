<script lang="ts" setup>
import { usePlanStore } from "../../stores/planStore";
import RecipeCard from "../RecipeCard.vue";

const planStore = usePlanStore();

function handleRemoveRecipeFromPlan(recipeId: string, planItemId?: string) {
    const success = planItemId
        ? planStore.removePlanItemById(planItemId)
        : planStore.removeRecipeFromPlan(recipeId);

    if (!success) {
        console.error("Failed to remove recipe from plan");
    }
}
</script>

<template>
    <div class="plan-container">
        <div class="plan-header">
            <h1>Ma Semaine</h1>
            <p class="recipe-count">
                {{ planStore.plan.length }} repas sélectionnés
            </p>
        </div>

        <div class="plan-content" v-if="planStore.plan.length > 0">
            <div class="recipes-list">
                <RecipeCard
                    v-for="planItem in planStore.plan"
                    :key="planItem.id"
                    :recipe="{ ...planItem.recipe, planItemId: planItem.id }"
                    @delete="handleRemoveRecipeFromPlan"
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
.plan-container {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    height: 100%;
    padding: 16px;
    overflow-y: auto;
}

.plan-header {
    margin-bottom: 24px;
}

.plan-header h1 {
    margin: 0 0 8px 0;
    font-size: 1.5rem;
    font-weight: 700;
}

.recipe-count {
    margin: 0;
    color: var(--text-secondary, #666);
    font-size: 0.9rem;
}

.plan-content {
    display: flex;
    flex-direction: column;
}

.recipes-list {
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
    .plan-container {
        padding: 24px;
    }

    .plan-header h1 {
        font-size: 2rem;
    }

    .recipes-list {
        gap: 16px;
    }
}

/* Desktop screens */
@media (min-width: 1024px) {
    .plan-container {
        padding: 32px;
        max-width: 1200px;
        margin: 0 auto;
    }

    .recipes-list {
        gap: 20px;
    }
}
</style>
