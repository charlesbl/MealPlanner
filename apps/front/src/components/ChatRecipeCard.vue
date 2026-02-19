<script setup lang="ts">
import AppButton from "@/components/ui/AppButton.vue";
import { libraryService } from "@mealplanner/shared-all";
import { useAuthStore } from "@/stores/authStore";
import { useLibraryStore } from "@/stores/libraryStore";
import { usePlanStore } from "@/stores/planStore";
import type { RecipeCardData } from "@mealplanner/shared-all";
import { computed, ref } from "vue";

const props = defineProps<{
    recipe: RecipeCardData;
}>();

const auth = useAuthStore();
const libraryStore = useLibraryStore();
const planStore = usePlanStore();

const planFeedback = ref(false);
const libraryFeedback = ref(false);
const addingToLibrary = ref(false);

const isInLibrary = computed(
    () => !!libraryStore.getRecipeById(props.recipe.id),
);

async function addToLibrary() {
    if (isInLibrary.value || addingToLibrary.value || !auth.token) return;
    addingToLibrary.value = true;
    try {
        await libraryService.addRecipe(
            {
                name: props.recipe.name,
                recipeTypes: [],
                nutrition: {
                    calories: props.recipe.calories,
                    protein: props.recipe.protein,
                    carbs: props.recipe.carbs,
                    fat: props.recipe.fat,
                },
            },
            auth.token,
        );
        await libraryStore.updateLibrary();
        libraryFeedback.value = true;
        setTimeout(() => (libraryFeedback.value = false), 2000);
    } catch (e) {
        console.error("addToLibrary error:", e);
    } finally {
        addingToLibrary.value = false;
    }
}

async function addToPlan() {
    await planStore.addRecipeToPlan(props.recipe.id);
    planFeedback.value = true;
    setTimeout(() => (planFeedback.value = false), 2000);
}
</script>

<template>
    <div class="chat-recipe-card">
        <p class="card-name">{{ recipe.name }}</p>
        <p class="card-nutrition">
            {{ recipe.calories }} kcal &nbsp;·&nbsp; P·{{ recipe.protein }}g
            &nbsp;G·{{ recipe.carbs }}g &nbsp;L·{{ recipe.fat }}g
        </p>
        <div class="card-actions">
            <AppButton
                variant="ghost"
                @click="addToLibrary"
                :disabled="isInLibrary || addingToLibrary"
            >
                {{
                    isInLibrary || libraryFeedback
                        ? "✓ Ajoutée"
                        : "+ Bibliothèque"
                }}
            </AppButton>
            <AppButton variant="ghost" @click="addToPlan">
                {{ planFeedback ? "✓ Planifié" : "Planifier" }}
            </AppButton>
        </div>
    </div>
</template>

<style scoped>
.chat-recipe-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 12px;
    margin: 8px 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.card-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
}

.card-nutrition {
    font-size: 13px;
    color: var(--color-muted);
    margin: 0;
}

.card-actions {
    display: flex;
    gap: 8px;
    margin-top: 4px;
}
</style>
