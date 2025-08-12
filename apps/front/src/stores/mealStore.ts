import * as mealService from "@mealplanner/shared-all";
import { type Meal } from "@mealplanner/shared-all";
import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useAuthStore } from "./authStore";

export const useMealStore = defineStore("mealStore", () => {
    const meals = ref<Meal[]>([]);
    const error = ref<string | null>(null);
    const auth = useAuthStore();

    const updateMeals = async () => {
        error.value = null;
        try {
            if (!auth.token) throw new Error("Not authenticated");
            meals.value = await mealService.fetchMeals(auth.token);
        } catch (e: any) {
            error.value = e.message || "Failed to fetch meals";
        }
    };

    const updateDeletedMeal = async (id: string) => {
        meals.value = meals.value.filter((meal) => meal.id !== id);
    };

    const deleteMeal = async (id: string) => {
        error.value = null;
        try {
            if (!auth.token) throw new Error("Not authenticated");
            await mealService.deleteMeal(id, auth.token);
            meals.value = meals.value.filter((m) => m.id !== id);
            return true;
        } catch (e: any) {
            error.value = e.message || "Failed to delete meal";
            return false;
        }
    };

    const getMealById = (id: string): Meal | undefined => {
        return meals.value.find((m) => m.id === id);
    };

    const mealCount = () => meals.value.length;

    // Fetch when authenticated token is available; clear on logout
    watch(
        () => auth.token,
        (token) => {
            if (token) void updateMeals();
            else meals.value = [];
        },
        { immediate: true }
    );

    return {
        meals,
        error,
        updateMeals,
        updateDeletedMeal,
        deleteMeal,
        getMealById,
        mealCount,
    };
});
