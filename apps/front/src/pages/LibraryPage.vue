<script setup lang="ts">
import LibraryRecipeCard from "@/components/LibraryRecipeCard.vue";
import RecipeDetailSheet from "@/components/RecipeDetailSheet.vue";
import AppInput from "@/components/ui/AppInput.vue";
import { useLibraryStore } from "@/stores/libraryStore";
import { type Recipe, RecipeType } from "@mealplanner/shared-all";
import { computed, ref } from "vue";

const libraryStore = useLibraryStore();

type FilterKey = "Tout" | "Matin" | "Midi" | "Soir" | "Snack";

const filters: FilterKey[] = ["Tout", "Matin", "Midi", "Soir", "Snack"];

const FILTER_TO_TYPE: Record<FilterKey, RecipeType | null> = {
    Tout: null,
    Matin: RecipeType.Breakfast,
    Midi: RecipeType.Lunch,
    Soir: RecipeType.Dinner,
    Snack: RecipeType.Snacks,
};

const activeFilter = ref<FilterKey>("Tout");
const showSearch = ref(false);
const searchQuery = ref("");
const selectedRecipe = ref<Recipe | null>(null);

const filteredRecipes = computed(() => {
    let list = [...libraryStore.library];
    const type = FILTER_TO_TYPE[activeFilter.value];
    if (type) {
        list = list.filter((r) => r.recipeTypes.includes(type));
    }
    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase();
        list = list.filter((r) => r.name.toLowerCase().includes(q));
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
});

function toggleSearch() {
    showSearch.value = !showSearch.value;
    if (!showSearch.value) searchQuery.value = "";
}

function openRecipe(recipe: Recipe) {
    selectedRecipe.value = recipe;
}
</script>

<template>
    <div class="library-page">
        <!-- Header -->
        <div class="library-header">
            <h1 class="library-title">MES RECETTES</h1>
            <div class="header-actions">
                <button
                    class="icon-btn"
                    @click="toggleSearch"
                    title="Rechercher"
                >
                    🔍
                </button>
            </div>
        </div>

        <!-- Search bar -->
        <div v-if="showSearch" class="search-bar">
            <AppInput
                v-model="searchQuery"
                placeholder="Rechercher une recette…"
            />
        </div>

        <!-- Filter tabs -->
        <div class="filter-tabs">
            <button
                v-for="f in filters"
                :key="f"
                class="filter-tab"
                :class="{ 'filter-tab-active': activeFilter === f }"
                @click="activeFilter = f"
            >
                {{ f.toUpperCase() }}
            </button>
        </div>

        <!-- Recipe count -->
        <p class="recipe-count">
            {{ filteredRecipes.length }} recette{{
                filteredRecipes.length !== 1 ? "s" : ""
            }}
        </p>

        <!-- Recipe grid -->
        <div v-if="filteredRecipes.length > 0" class="recipe-grid">
            <LibraryRecipeCard
                v-for="recipe in filteredRecipes"
                :key="recipe.id"
                :recipe="recipe"
                @select="openRecipe"
            />
        </div>

        <!-- Empty state -->
        <div v-else class="empty-state">
            <p class="empty-text">Aucune recette dans cette catégorie</p>
            <p class="empty-sub">Demandez à l'IA d'en créer une</p>
        </div>

        <!-- Recipe detail sheet -->
        <RecipeDetailSheet
            :recipe="selectedRecipe"
            @close="selectedRecipe = null"
        />
    </div>
</template>

<style scoped>
.library-page {
    padding: 20px 16px 32px;
    display: flex;
    flex-direction: column;
}

.library-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.library-title {
    font-size: 22px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
    letter-spacing: -0.01em;
}

.header-actions {
    display: flex;
    gap: 8px;
    align-items: center;
}

.icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    padding: 4px;
    opacity: 0.7;
    transition: opacity 0.15s;
}

.icon-btn:hover {
    opacity: 1;
}

.search-bar {
    margin-bottom: 12px;
}

/* Filter tabs */
.filter-tabs {
    display: flex;
    gap: 20px;
    overflow-x: auto;
    margin-bottom: 12px;
    padding-bottom: 4px;
    scrollbar-width: none;
}

.filter-tabs::-webkit-scrollbar {
    display: none;
}

.filter-tab {
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    font-size: 12px;
    letter-spacing: 0.06em;
    color: var(--color-muted);
    cursor: pointer;
    padding: 4px 0;
    white-space: nowrap;
    transition: color 0.15s;
    flex-shrink: 0;
}

.filter-tab-active {
    color: var(--color-text);
    border-bottom-color: var(--color-accent);
}

/* Recipe count */
.recipe-count {
    font-size: 12px;
    color: var(--color-muted);
    margin: 0 0 12px;
}

/* Recipe grid */
.recipe-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
}

/* Empty state */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
    gap: 8px;
}

.empty-text {
    font-size: 14px;
    color: var(--color-text);
    margin: 0;
}

.empty-sub {
    font-size: 12px;
    color: var(--color-muted);
    margin: 0;
}
</style>
