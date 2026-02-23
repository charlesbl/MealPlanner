import type { Meal } from "@mealplanner/shared-all";
import { planService } from "@mealplanner/shared-all";
import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useAuthStore } from "./authStore";

export const usePlanStore = defineStore("planStore", () => {
    const plan = ref<Meal[]>([]);
    const error = ref<string | null>(null);
    const auth = useAuthStore();

    async function updatePlan() {
        error.value = null;
        try {
            if (!auth.token) throw new Error("Not authenticated");
            plan.value = await planService.fetchPlan(auth.token);
        } catch (e: any) {
            error.value = e?.message || "Failed to fetch plan";
        }
    }

    async function addRecipeToPlan(recipeId: string): Promise<Meal | null> {
        try {
            if (!auth.token) throw new Error("Not authenticated");
            const created = await planService.addToPlan(
                { recipeId },
                auth.token,
            );
            plan.value.push(created);
            return created;
        } catch (e: any) {
            error.value = e?.message || "Failed to add to plan";
            return null;
        }
    }

    async function removeRecipeFromPlan(mealId: string): Promise<boolean> {
        try {
            if (!auth.token) throw new Error("Not authenticated");
            await planService.removeFromPlan({ id: mealId }, auth.token);
            const idx = plan.value.findIndex(
                (meal: Meal) => meal.id === mealId,
            );
            if (idx === -1) return false;
            plan.value.splice(idx, 1);
            plan.value.forEach((wm: Meal, i: number) => {
                wm.order = i;
            });
            return true;
        } catch (e: any) {
            error.value = e?.message || "Failed to remove from plan";
            return false;
        }
    }

    async function removeMealById(mealId: string): Promise<boolean> {
        const item = plan.value.find((meal: Meal) => meal.id === mealId);
        if (!item) return false;
        return removeRecipeFromPlan(item.id);
    }

    watch(
        () => auth.token,
        (token) => {
            if (token) void updatePlan();
            else plan.value = [];
        },
        { immediate: true },
    );

    return {
        plan,
        error,
        updatePlan,
        addRecipeToPlan,
        removeRecipeFromPlan,
        removeMealById,
    };
});
