<script setup lang="ts">
import type { Recipe } from "@mealplanner/shared-all";

defineProps<{
    recipe: Recipe;
}>();

defineEmits<{
    select: [recipe: Recipe];
}>();
</script>

<template>
    <div class="recipe-card" @click="$emit('select', recipe)">
        <p class="recipe-name">{{ recipe.name }}</p>
        <template v-if="recipe.nutrition">
            <p class="recipe-calories">{{ recipe.nutrition.calories }}</p>
            <p class="recipe-macros">
                P·{{ recipe.nutrition.protein }} G·{{
                    recipe.nutrition.carbs
                }}
                L·{{ recipe.nutrition.fat }}
            </p>
        </template>
        <template v-else>
            <p class="recipe-calories no-data">—</p>
            <p class="recipe-macros">kcal non calculées</p>
        </template>
    </div>
</template>

<style scoped>
.recipe-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 12px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 4px;
    transition: opacity 0.15s;
    min-height: 90px;
}

.recipe-card:hover {
    opacity: 0.85;
}

.recipe-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text);
    margin: 0;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.recipe-calories {
    font-size: 26px;
    font-weight: 600;
    color: var(--color-accent);
    margin: 4px 0 0;
    line-height: 1;
}

.recipe-calories.no-data {
    color: var(--color-muted);
}

.recipe-macros {
    font-size: 11px;
    color: var(--color-muted);
    margin: 0;
    letter-spacing: 0.02em;
}
</style>
