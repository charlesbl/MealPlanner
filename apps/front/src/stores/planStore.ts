import type { PlanItem } from "@mealplanner/shared-all";
import { planService } from "@mealplanner/shared-all";
import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useAuthStore } from "./authStore";

export const usePlanStore = defineStore("planStore", () => {
    const plan = ref<PlanItem[]>([]);
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

    async function addMealToPlan(mealId: string): Promise<PlanItem | null> {
        try {
            if (!auth.token) throw new Error("Not authenticated");
            const created = await planService.addToPlan({ mealId }, auth.token);
            plan.value.push(created);
            return created;
        } catch (e: any) {
            error.value = e?.message || "Failed to add to plan";
            return null;
        }
    }

    async function removeMealFromPlan(planItemId: string): Promise<boolean> {
        try {
            if (!auth.token) throw new Error("Not authenticated");
            await planService.removeFromPlan({ id: planItemId }, auth.token);
            const idx = plan.value.findIndex(
                (planItem: PlanItem) => planItem.id === planItemId
            );
            if (idx === -1) return false;
            plan.value.splice(idx, 1);
            plan.value.forEach((wm: PlanItem, i: number) => {
                wm.order = i;
            });
            return true;
        } catch (e: any) {
            error.value = e?.message || "Failed to remove from plan";
            return false;
        }
    }

    async function removePlanItemById(planItemId: string): Promise<boolean> {
        const item = plan.value.find(
            (planItem: PlanItem) => planItem.id === planItemId
        );
        if (!item) return false;
        return removeMealFromPlan(item.id);
    }

    watch(
        () => auth.token,
        (token) => {
            if (token) void updatePlan();
            else plan.value = [];
        },
        { immediate: true }
    );

    return {
        plan,
        error,
        updatePlan,
        addMealToPlan,
        removeMealFromPlan,
        removePlanItemById,
    };
});
