import { libraryService, type Recipe } from "@mealplanner/shared-all";
import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useAuthStore } from "./authStore";

export const useLibraryStore = defineStore("libraryStore", () => {
    const library = ref<Recipe[]>([]);
    const error = ref<string | null>(null);
    const auth = useAuthStore();

    const updateLibrary = async () => {
        error.value = null;
        try {
            if (!auth.token) throw new Error("Not authenticated");
            library.value = await libraryService.fetchLibrary(auth.token);
        } catch (e: any) {
            error.value = e.message || "Failed to fetch recipes";
        }
    };

    const updateDeletedRecipe = async (id: string) => {
        library.value = library.value.filter((recipe) => recipe.id !== id);
    };

    const deleteRecipe = async (id: string) => {
        error.value = null;
        try {
            if (!auth.token) throw new Error("Not authenticated");
            await libraryService.deleteRecipe(id, auth.token);
            library.value = library.value.filter((m) => m.id !== id);
            return true;
        } catch (e: any) {
            error.value = e.message || "Failed to delete recipe";
            return false;
        }
    };

    const getRecipeById = (id: string): Recipe | undefined => {
        return library.value.find((m) => m.id === id);
    };

    const recipeCount = () => library.value.length;

    // Fetch when authenticated token is available; clear on logout
    watch(
        () => auth.token,
        (token) => {
            if (token) void updateLibrary();
            else library.value = [];
        },
        { immediate: true }
    );

    return {
        library,
        error,
        updateLibrary,
        updateDeletedRecipe,
        deleteRecipe,
        getRecipeById,
        recipeCount,
    };
});
