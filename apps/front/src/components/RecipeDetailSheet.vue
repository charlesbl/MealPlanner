<script setup lang="ts">
import MacroBar from "@/components/MacroBar.vue";
import MarkdownRenderer from "@/components/MarkdownRenderer.vue";
import AppButton from "@/components/ui/AppButton.vue";
import AppDivider from "@/components/ui/AppDivider.vue";
import { useLibraryStore } from "@/stores/libraryStore";
import { usePlanStore } from "@/stores/planStore";
import { type Recipe, RecipeType } from "@mealplanner/shared-all";
import { ref } from "vue";

const props = defineProps<{
    recipe: Recipe | null;
}>();

const emit = defineEmits<{
    close: [];
}>();

const libraryStore = useLibraryStore();
const planStore = usePlanStore();
const planFeedback = ref(false);
const deleteFeedback = ref(false);

const TYPE_LABELS: Record<RecipeType, string> = {
    [RecipeType.Breakfast]: "Matin",
    [RecipeType.Lunch]: "Midi",
    [RecipeType.Dinner]: "Soir",
    [RecipeType.Snacks]: "Snack",
};

async function addToPlan() {
    if (!props.recipe) return;
    await planStore.addRecipeToPlan(props.recipe.id);
    planFeedback.value = true;
    setTimeout(() => (planFeedback.value = false), 2000);
}

async function handleDelete() {
    if (!props.recipe) return;
    deleteFeedback.value = true;
    await libraryStore.deleteRecipe(props.recipe.id);
    emit("close");
}
</script>

<template>
    <Teleport to="body">
        <div
            v-show="!!recipe"
            class="sheet-overlay"
            @click.self="emit('close')"
        >
            <div class="sheet" :class="{ open: !!recipe }">
                <template v-if="recipe">
                    <!-- Header -->
                    <div class="sheet-header">
                        <h2 class="sheet-title">{{ recipe.name }}</h2>
                        <button class="close-btn" @click="emit('close')">
                            ✕
                        </button>
                    </div>

                    <!-- Type badges -->
                    <div class="type-badges">
                        <span
                            v-for="t in recipe.recipeTypes"
                            :key="t"
                            class="type-badge"
                        >
                            {{ TYPE_LABELS[t] }}
                        </span>
                    </div>

                    <!-- Nutrition -->
                    <template v-if="recipe.nutrition">
                        <AppDivider />
                        <div class="nutrition-block">
                            <p class="nutrition-calories">
                                {{ recipe.nutrition.calories }} kcal
                            </p>
                            <div class="macro-bars">
                                <MacroBar
                                    label="Protéines"
                                    :current="recipe.nutrition.protein"
                                />
                                <MacroBar
                                    label="Glucides"
                                    :current="recipe.nutrition.carbs"
                                />
                                <MacroBar
                                    label="Lipides"
                                    :current="recipe.nutrition.fat"
                                />
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <p class="no-nutrition">
                            Macros non calculées — demandez à l'IA de les
                            estimer.
                        </p>
                    </template>

                    <!-- Description -->
                    <AppDivider />
                    <div class="description">
                        <MarkdownRenderer v-if="recipe.description">
                            {{ recipe.description }}
                        </MarkdownRenderer>
                        <p v-else class="no-description">Aucune description.</p>
                    </div>

                    <!-- Actions -->
                    <AppDivider />
                    <div class="sheet-actions">
                        <AppButton @click="addToPlan">
                            {{ planFeedback ? "✓ Planifié" : "Planifier" }}
                        </AppButton>
                        <AppButton
                            variant="danger"
                            @click="handleDelete"
                            :disabled="deleteFeedback"
                        >
                            Supprimer
                        </AppButton>
                    </div>
                </template>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.sheet-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 100;
}

.sheet {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--color-surface);
    border-radius: 12px 12px 0 0;
    padding: 20px 16px;
    max-height: 85dvh;
    overflow-y: auto;
    transform: translateY(100%);
    transition: transform 0.3s ease;
}

.sheet.open {
    transform: translateY(0);
}

.sheet-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
}

.sheet-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
    flex: 1;
    line-height: 1.3;
}

.close-btn {
    background: none;
    border: none;
    color: var(--color-muted);
    font-size: 16px;
    cursor: pointer;
    padding: 2px;
    flex-shrink: 0;
}

.type-badges {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 12px;
}

.type-badge {
    font-size: 11px;
    color: var(--color-muted);
    border: 1px solid var(--color-border);
    padding: 2px 8px;
    border-radius: 3px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.nutrition-block {
    padding: 12px 0;
}

.nutrition-calories {
    font-size: 22px;
    font-weight: 600;
    color: var(--color-accent);
    margin: 0 0 10px;
}

.macro-bars {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.no-nutrition {
    font-size: 13px;
    color: var(--color-muted);
    margin: 12px 0;
    font-style: italic;
}

.description {
    padding: 12px 0;
    font-size: 13px;
    color: var(--color-text);
    line-height: 1.6;
}

.no-description {
    font-size: 13px;
    color: var(--color-muted);
    margin: 0;
    font-style: italic;
}

.sheet-actions {
    display: flex;
    gap: 10px;
    padding-top: 12px;
    justify-content: flex-end;
}
</style>
