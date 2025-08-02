import { defineStore } from "pinia";
import { reactive, watch } from "vue";
import { MealType, useMealStore, type Meal } from "./mealStore";

// Define the selected meal for the week
export interface WeekMeal {
    id: string;
    mealId: string;
    addedAt: Date;
    order: number; // For custom ordering
}

// Define the week state
export interface WeekState {
    selectedMeals: WeekMeal[];
    weekStartDate?: Date; // Optional: track which week this selection is for
}

// Helper function to validate the loaded week data
function isValidWeekState(data: any): data is WeekState {
    if (typeof data !== "object" || data === null) {
        console.warn("Invalid week data: not an object.");
        return false;
    }

    if (!Array.isArray(data.selectedMeals)) {
        console.warn("Invalid week data: selectedMeals is not an array.");
        return false;
    }

    for (const weekMeal of data.selectedMeals) {
        if (
            typeof weekMeal !== "object" ||
            weekMeal === null ||
            typeof weekMeal.id !== "string" ||
            typeof weekMeal.mealId !== "string" ||
            !weekMeal.addedAt ||
            typeof weekMeal.order !== "number"
        ) {
            console.warn(
                "Invalid week data: invalid weekMeal structure.",
                weekMeal
            );
            return false;
        }
    }

    return true;
}

// Helper function to load week data from localStorage
function loadWeekFromLocalStorage(): WeekState {
    const storedWeek = localStorage.getItem("weekSelection");
    if (storedWeek) {
        let parsedWeek: any;
        try {
            parsedWeek = JSON.parse(storedWeek);
        } catch (e) {
            console.error("Error parsing week data from localStorage", e);
            localStorage.removeItem("weekSelection");
            return { selectedMeals: [] };
        }

        // Convert addedAt strings back to Date objects
        if (parsedWeek.selectedMeals) {
            parsedWeek.selectedMeals = parsedWeek.selectedMeals.map(
                (weekMeal: any) => ({
                    ...weekMeal,
                    addedAt: new Date(weekMeal.addedAt),
                })
            );
        }

        if (parsedWeek.weekStartDate) {
            parsedWeek.weekStartDate = new Date(parsedWeek.weekStartDate);
        }

        if (isValidWeekState(parsedWeek)) {
            return parsedWeek;
        } else {
            console.warn(
                "Stored week data failed validation. Discarding invalid data."
            );
            localStorage.removeItem("weekSelection");
            return { selectedMeals: [] };
        }
    }
    return { selectedMeals: [] };
}

// Helper function to generate unique ID
function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export const useWeekStore = defineStore("weekStore", () => {
    // --- State ---
    const state = reactive<WeekState>(loadWeekFromLocalStorage());

    // --- Watch for changes and save to localStorage ---
    watch(
        state,
        (newState: WeekState) => {
            localStorage.setItem("weekSelection", JSON.stringify(newState));
        },
        { deep: true }
    );

    // --- Actions ---

    // Add a meal to the week selection
    function addMealToWeek(mealId: string): string {
        // Check if meal is already in the week
        const existing = state.selectedMeals.find((wm) => wm.mealId === mealId);
        if (existing) {
            return existing.id; // Already added, return existing ID
        }

        const id = generateId();
        const weekMeal: WeekMeal = {
            id,
            mealId,
            addedAt: new Date(),
            order: state.selectedMeals.length,
        };

        state.selectedMeals.push(weekMeal);
        return id;
    }

    // Remove a meal from the week selection
    function removeMealFromWeek(mealId: string): boolean {
        const index = state.selectedMeals.findIndex(
            (wm) => wm.mealId === mealId
        );
        if (index === -1) {
            return false;
        }

        state.selectedMeals.splice(index, 1);

        // Reorder remaining meals
        state.selectedMeals.forEach((wm, idx) => {
            wm.order = idx;
        });

        return true;
    }

    // Remove a meal by week meal ID
    function removeWeekMealById(weekMealId: string): boolean {
        const index = state.selectedMeals.findIndex(
            (wm) => wm.id === weekMealId
        );
        if (index === -1) {
            return false;
        }

        state.selectedMeals.splice(index, 1);

        // Reorder remaining meals
        state.selectedMeals.forEach((wm, idx) => {
            wm.order = idx;
        });

        return true;
    }

    // Clear all selected meals
    function clearWeek(): void {
        state.selectedMeals = [];
    }

    // Check if a meal is selected for the week
    function isMealInWeek(mealId: string): boolean {
        return state.selectedMeals.some((wm) => wm.mealId === mealId);
    }

    // Get selected meals with full meal data
    function getSelectedMealsWithData(): (Meal & {
        weekMealId: string;
        order: number;
    })[] {
        const mealStore = useMealStore();

        return state.selectedMeals
            .map((weekMeal) => {
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
                (meal): meal is Meal & { weekMealId: string; order: number } =>
                    meal !== null
            )
            .sort((a, b) => a.order - b.order);
    }

    // Generate automatic week selection
    function generateWeekSelection(
        numberOfMeals: number,
        mealTypeDistribution?: Partial<Record<MealType, number>>
    ): void {
        const mealStore = useMealStore();
        const allMeals = mealStore.getAllMeals();

        if (allMeals.length === 0) {
            console.warn("No meals available for week generation");
            return;
        }

        // Clear current selection
        clearWeek();

        let selectedMeals: Meal[] = [];

        if (mealTypeDistribution) {
            // Generate based on distribution
            for (const [mealType, count] of Object.entries(
                mealTypeDistribution
            )) {
                const mealsOfType = allMeals.filter(
                    (m) => m.mealTypes.includes(mealType as MealType)
                );
                const shuffled = [...mealsOfType].sort(
                    () => Math.random() - 0.5
                );
                const selected = shuffled.slice(0, count);
                selectedMeals.push(...selected);
            }
        } else {
            // Random selection
            const shuffled = [...allMeals].sort(() => Math.random() - 0.5);
            selectedMeals = shuffled.slice(0, numberOfMeals);
        }

        // Add selected meals to the week
        selectedMeals.forEach((meal) => {
            addMealToWeek(meal.id);
        });
    }

    // Reorder meals in the week
    function reorderWeekMeals(weekMealIds: string[]): boolean {
        try {
            // Validate that all IDs exist
            const allIds = state.selectedMeals.map((wm) => wm.id);
            if (
                !weekMealIds.every((id) => allIds.includes(id)) ||
                weekMealIds.length !== allIds.length
            ) {
                return false;
            }

            // Reorder
            weekMealIds.forEach((id, index) => {
                const weekMeal = state.selectedMeals.find((wm) => wm.id === id);
                if (weekMeal) {
                    weekMeal.order = index;
                }
            });

            // Sort by new order
            state.selectedMeals.sort((a, b) => a.order - b.order);

            return true;
        } catch (error) {
            console.error("Error reordering week meals:", error);
            return false;
        }
    }

    // --- Getters ---
    const selectedMealCount = () => state.selectedMeals.length;

    const selectedMealsByType = () => {
        const mealsWithData = getSelectedMealsWithData();
        const byType: Partial<
            Record<MealType, (Meal & { weekMealId: string; order: number })[]>
        > = {};

        mealsWithData.forEach((meal) => {
            meal.mealTypes.forEach((mealType) => {
                if (!byType[mealType]) {
                    byType[mealType] = [];
                }
                byType[mealType]!.push(meal);
            });
        });

        return byType;
    };

    return {
        // State
        selectedMeals: state.selectedMeals,
        weekStartDate: state.weekStartDate,

        // Actions
        addMealToWeek,
        removeMealFromWeek,
        removeWeekMealById,
        clearWeek,
        isMealInWeek,
        getSelectedMealsWithData,
        generateWeekSelection,
        reorderWeekMeals,

        // Getters
        selectedMealCount,
        selectedMealsByType,
    };
});
