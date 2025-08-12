import { type Meal, generateId } from "@mealplanner/shared-all";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useMealStore } from "./mealStore";

export const useWeekStore = defineStore("weekStore", () => {
    type WeekMeal = {
        id: string;
        mealId: string;
        addedAt: Date;
        order: number;
    };
    const selectedMeals = ref<WeekMeal[]>([]);

    function addMealToWeek(mealId: string): string {
        const existing = selectedMeals.value.find(
            (wm: WeekMeal) => wm.mealId === mealId
        );
        if (existing) return existing.id;
        const id = generateId();
        selectedMeals.value.push({
            id,
            mealId,
            addedAt: new Date(),
            order: selectedMeals.value.length,
        });
        return id;
    }

    function removeMealFromWeek(mealId: string): boolean {
        const idx = selectedMeals.value.findIndex(
            (wm: WeekMeal) => wm.mealId === mealId
        );
        if (idx === -1) return false;
        selectedMeals.value.splice(idx, 1);
        selectedMeals.value.forEach((wm: WeekMeal, i: number) => {
            wm.order = i;
        });
        return true;
    }

    function removeWeekMealById(weekMealId: string): boolean {
        const idx = selectedMeals.value.findIndex(
            (wm: WeekMeal) => wm.id === weekMealId
        );
        if (idx === -1) return false;
        selectedMeals.value.splice(idx, 1);
        selectedMeals.value.forEach((wm: WeekMeal, i: number) => {
            wm.order = i;
        });
        return true;
    }

    function clearWeek() {
        selectedMeals.value = [];
    }

    function isMealInWeek(mealId: string): boolean {
        return selectedMeals.value.some((wm: WeekMeal) => wm.mealId === mealId);
    }

    function getSelectedMealsWithData(): (Meal & {
        weekMealId: string;
        order: number;
    })[] {
        const mealStore = useMealStore();
        return selectedMeals.value
            .map((weekMeal: WeekMeal) => {
                const meal = mealStore.getMealById(weekMeal.mealId);
                if (meal) {
                    return {
                        ...meal,
                        weekMealId: weekMeal.id,
                        order: weekMeal.order,
                    };
                }
                return null;
            })
            .filter(
                (
                    meal: Meal | null
                ): meal is Meal & { weekMealId: string; order: number } =>
                    meal !== null
            )
            .sort(
                (
                    a: Meal & { weekMealId: string; order: number },
                    b: Meal & { weekMealId: string; order: number }
                ) => a.order - b.order
            );
    }

    const selectedMealCount = () => selectedMeals.value.length;

    return {
        selectedMeals,
        addMealToWeek,
        removeMealFromWeek,
        removeWeekMealById,
        clearWeek,
        isMealInWeek,
        getSelectedMealsWithData,
        selectedMealCount,
    };
});
