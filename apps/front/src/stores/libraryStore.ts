import * as libraryService from "@mealplanner/shared-all";
import { type Meal } from "@mealplanner/shared-all";
import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useAuthStore } from "./authStore";

export const useLibraryStore = defineStore("libraryStore", () => {
    const library = ref<Meal[]>([]);
    const error = ref<string | null>(null);
    const auth = useAuthStore();

    const updateLibrary = async () => {
        error.value = null;
        try {
            if (!auth.token) throw new Error("Not authenticated");
            library.value = await libraryService.fetchLibrary(auth.token);
        } catch (e: any) {
            error.value = e.message || "Failed to fetch meals";
        }
    };

    const updateDeletedMeal = async (id: string) => {
        library.value = library.value.filter((meal) => meal.id !== id);
    };

    const deleteMeal = async (id: string) => {
        error.value = null;
        try {
            if (!auth.token) throw new Error("Not authenticated");
            await libraryService.deleteMeal(id, auth.token);
            library.value = library.value.filter((m) => m.id !== id);
            return true;
        } catch (e: any) {
            error.value = e.message || "Failed to delete meal";
            return false;
        }
    };

    const getMealById = (id: string): Meal | undefined => {
        return library.value.find((m) => m.id === id);
    };

    const mealCount = () => library.value.length;

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
        updateDeletedMeal,
        deleteMeal,
        getMealById,
        mealCount,
    };
});
