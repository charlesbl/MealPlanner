import { type Meal, generateId } from "@mealplanner/shared-all";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useLibraryStore } from "./libraryStore";

export const usePlanStore = defineStore("planStore", () => {
    type PlanMeal = {
        id: string;
        mealId: string;
        addedAt: Date;
        order: number;
    };
    const plan = ref<PlanMeal[]>([]);

    function addMealToPlan(mealId: string): string {
        const existing = plan.value.find(
            (wm: PlanMeal) => wm.mealId === mealId
        );
        if (existing) return existing.id;
        const id = generateId();
        plan.value.push({
            id,
            mealId,
            addedAt: new Date(),
            order: plan.value.length,
        });
        return id;
    }

    function removeMealFromPlan(mealId: string): boolean {
        const idx = plan.value.findIndex(
            (wm: PlanMeal) => wm.mealId === mealId
        );
        if (idx === -1) return false;
        plan.value.splice(idx, 1);
        plan.value.forEach((wm: PlanMeal, i: number) => {
            wm.order = i;
        });
        return true;
    }

    function removePlanMealById(planMealId: string): boolean {
        const idx = plan.value.findIndex(
            (wm: PlanMeal) => wm.id === planMealId
        );
        if (idx === -1) return false;
        plan.value.splice(idx, 1);
        plan.value.forEach((wm: PlanMeal, i: number) => {
            wm.order = i;
        });
        return true;
    }

    function clearPlan() {
        plan.value = [];
    }

    function isMealInPlan(mealId: string): boolean {
        return plan.value.some((wm: PlanMeal) => wm.mealId === mealId);
    }

    function getPlanWithData(): (Meal & {
        planMealId: string;
        order: number;
    })[] {
        const libraryStore = useLibraryStore();
        return plan.value
            .map((planMeal: PlanMeal) => {
                const meal = libraryStore.getMealById(planMeal.mealId);
                if (meal) {
                    return {
                        ...meal,
                        planMealId: planMeal.id,
                        order: planMeal.order,
                    };
                }
                return null;
            })
            .filter(
                (
                    meal: Meal | null
                ): meal is Meal & { planMealId: string; order: number } =>
                    meal !== null
            )
            .sort(
                (
                    a: Meal & { planMealId: string; order: number },
                    b: Meal & { planMealId: string; order: number }
                ) => a.order - b.order
            );
    }

    const selectedMealCount = () => plan.value.length;

    return {
        plan,
        addMealToPlan,
        removeMealFromPlan,
        removePlanMealById,
        clearPlan,
        isMealInPlan,
        getPlanWithData,
        selectedMealCount,
    };
});
