import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { MealType } from "./mealStore";

export type MealTypeFilter = MealType | "All";

export const useMealTypeFilterStore = defineStore("mealTypeFilterStore", () => {
    // --- State ---
    const selectedMealType = ref<MealTypeFilter>("All");

    // --- Computed Properties ---
    const isFilterActive = computed(() => {
        return selectedMealType.value !== "All";
    });

    const filterText = computed(() => {
        if (selectedMealType.value === "All") {
            return "All Meals";
        }
        return selectedMealType.value;
    });

    const mealTypeOptions = computed(() => [
        { value: "All" as const, label: "All Meals" },
        ...Object.values(MealType).map((type) => ({
            value: type,
            label: type,
        })),
    ]);

    // --- Actions ---
    function setMealType(mealType: MealTypeFilter) {
        selectedMealType.value = mealType;
    }

    function clearFilter() {
        selectedMealType.value = "All";
    }

    function setBreakfast() {
        selectedMealType.value = MealType.Breakfast;
    }

    function setLunch() {
        selectedMealType.value = MealType.Lunch;
    }

    function setDinner() {
        selectedMealType.value = MealType.Dinner;
    }

    function setSnacks() {
        selectedMealType.value = MealType.Snacks;
    }

    return {
        // State
        selectedMealType,

        // Computed
        isFilterActive,
        filterText,
        mealTypeOptions,

        // Actions
        setMealType,
        clearFilter,
        setBreakfast,
        setLunch,
        setDinner,
        setSnacks,
    };
});
