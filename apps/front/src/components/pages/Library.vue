<script lang="ts" setup>
import { computed } from "vue";
import { useLibraryStore } from "../../stores/libraryStore";
import RecipeCard from "../RecipeCard.vue";

const libraryStore = useLibraryStore();

const sortedLibrary = computed(() =>
    libraryStore.library.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )
);

function handleDeleteRecipe(recipeId: string) {
    const success = libraryStore.deleteRecipe(recipeId);
    if (!success) {
        console.error("Failed to delete recipe");
    }
}
</script>

<template>
    <div class="library-container">
        <div class="library-header">
            <h1>Mes Repas</h1>
            <p class="recipe-count">
                {{ sortedLibrary.length }} repas enregistrés
            </p>
        </div>
        <div class="recipes-list" v-if="sortedLibrary.length > 0">
            <RecipeCard
                v-for="recipe in sortedLibrary"
                :key="recipe.id"
                :recipe="recipe"
                @delete="handleDeleteRecipe"
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
.library-container {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    height: 100%;
    padding: 16px;
    overflow-y: auto;
}

.library-header {
    margin-bottom: 24px;
}

.library-header h1 {
    margin: 0 0 8px 0;
    font-size: 1.5rem;
    font-weight: 700;
}

.recipe-count {
    margin: 0;
    color: var(--text-secondary, #666);
    font-size: 0.9rem;
}

.recipes-list {
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
    .library-container {
        padding: 24px;
    }

    .library-header h1 {
        font-size: 2rem;
    }

    .recipes-list {
        gap: 12px;
    }
}

/* Desktop screens */
@media (min-width: 1024px) {
    .library-container {
        padding: 32px;
        max-width: 1200px;
        margin: 0 auto;
    }
}
</style>
