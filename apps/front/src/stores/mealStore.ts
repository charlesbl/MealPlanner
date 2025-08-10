import * as mealService from "@mealplanner/shared";
import { type Meal } from "@mealplanner/shared";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useMealStore = defineStore("mealStore", () => {
    const meals = ref<Meal[]>([]);
    const error = ref<string | null>(null);

    async function deleteMeal(id: string) {
        error.value = null;
        try {
            await mealService.deleteMeal(id);
            meals.value = meals.value.filter((m) => m.id !== id);
            return true;
        } catch (e: any) {
            error.value = e.message || "Failed to delete meal";
            return false;
        }
    }

    function getMealById(id: string): Meal | undefined {
        return meals.value.find((m) => m.id === id);
    }

    const mealCount = () => meals.value.length;

    return {
        meals,
        error,
        deleteMeal,
        getMealById,
        mealCount,
    };
});
