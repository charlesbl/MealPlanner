import {
    generateId,
    MealType,
    type Meal,
    type MealsState,
} from "@mealplanner/shared";
import { defineStore } from "pinia";
import { reactive, watch } from "vue";

// Helper function to validate the loaded meals data
function isValidMealsState(data: any): data is MealsState {
    if (typeof data !== "object" || data === null) {
        console.warn("Invalid meals data: not an object.");
        return false;
    }

    if (!Array.isArray(data.meals)) {
        console.warn("Invalid meals data: meals is not an array.");
        return false;
    }

    for (const meal of data.meals) {
        if (
            typeof meal !== "object" ||
            meal === null ||
            typeof meal.id !== "string" ||
            typeof meal.name !== "string" ||
            typeof meal.description !== "string" ||
            !Array.isArray(meal.mealTypes) ||
            meal.mealTypes.length === 0 ||
            !meal.mealTypes.every((type: any) =>
                Object.values(MealType).includes(type)
            ) ||
            !meal.createdAt
        ) {
            console.warn("Invalid meals data: invalid meal structure.", meal);
            return false;
        }
    }

    return true;
}

// Helper function to load meals from localStorage
function loadMealsFromLocalStorage(): MealsState {
    const storedMeals = localStorage.getItem("meals");
    if (storedMeals) {
        let parsedMeals: any;
        try {
            parsedMeals = JSON.parse(storedMeals);
        } catch (e) {
            console.error("Error parsing meals from localStorage", e);
            localStorage.removeItem("meals");
            return { meals: [] };
        }

        // Convert createdAt strings back to Date objects and handle migration from old format
        if (parsedMeals.meals) {
            parsedMeals.meals = parsedMeals.meals.map((meal: any) => ({
                id: meal.id,
                name: meal.name,
                description: meal.description,
                mealTypes:
                    meal.mealTypes || (meal.mealType ? [meal.mealType] : []),
                createdAt: new Date(meal.createdAt),
                // Ignore the old 'date' field during migration
            }));
        }

        // Ensure we have the correct structure (handle old format)
        const migratedData = {
            meals: parsedMeals.meals || [],
        };

        if (isValidMealsState(migratedData)) {
            return migratedData;
        } else {
            console.warn(
                "Stored meals data failed validation. Discarding invalid data."
            );
            localStorage.removeItem("meals");
            return { meals: [] };
        }
    }
    return { meals: [] };
}

export const useMealStore = defineStore("mealStore", () => {
    // --- State ---
    const state = reactive<MealsState>(loadMealsFromLocalStorage());

    // --- Watch for changes and save to localStorage ---
    watch(
        state,
        (newState) => {
            localStorage.setItem("meals", JSON.stringify(newState));
        },
        { deep: true }
    );

    // --- Actions ---
    // Action to add a new meal
    function addMeal(
        name: string,
        description: string,
        mealTypes: MealType[]
    ): string {
        const id = generateId();
        const newMeal: Meal = {
            id,
            name: name.trim(),
            description: description.trim(),
            mealTypes,
            createdAt: new Date(),
        };
        state.meals.push(newMeal);
        return id;
    }

    // Action to update an existing meal
    function updateMeal(
        id: string,
        updates: Partial<Omit<Meal, "id" | "createdAt">>
    ): boolean {
        const mealIndex = state.meals.findIndex((meal: Meal) => meal.id === id);
        if (mealIndex === -1) {
            return false;
        }

        // Update the meal with new values
        if (updates.name !== undefined) {
            state.meals[mealIndex].name = updates.name.trim();
        }
        if (updates.description !== undefined) {
            state.meals[mealIndex].description = updates.description.trim();
        }
        if (updates.mealTypes !== undefined) {
            state.meals[mealIndex].mealTypes = updates.mealTypes;
        }

        return true;
    }

    // Action to delete a meal
    function deleteMeal(id: string): boolean {
        const mealIndex = state.meals.findIndex((meal: Meal) => meal.id === id);
        if (mealIndex === -1) {
            return false;
        }
        state.meals.splice(mealIndex, 1);
        return true;
    }

    // Action to get a meal by ID
    function getMealById(id: string): Meal | undefined {
        return state.meals.find((meal: Meal) => meal.id === id);
    }

    // Action to get meals by type
    function getMealsByType(mealType: MealType): Meal[] {
        return state.meals.filter((meal: Meal) =>
            meal.mealTypes.includes(mealType)
        );
    }

    // Action to get all meals sorted by creation date (newest first)
    function getAllMeals(): Meal[] {
        return [...state.meals].sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );
    }
    // --- Getters ---
    const mealCount = () => state.meals.length;

    return {
        // State
        meals: state.meals,

        // Actions
        addMeal,
        updateMeal,
        deleteMeal,
        getMealById,
        getMealsByType,
        getAllMeals,

        // Getters
        mealCount,
    };
});
