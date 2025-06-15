import { defineStore } from "pinia";
import { reactive, watch } from "vue";

// Define the meal types
export enum MealType {
    Breakfast = "Breakfast",
    Lunch = "Lunch",
    Dinner = "Dinner",
    Snacks = "Snacks",
}

// Define the Meal interface
export interface Meal {
    id: string;
    name: string;
    description: string;
    mealType: MealType;
    date: Date;
    createdAt: Date;
}

// Define the structure for date-based meal assignments
export interface DateMeal {
    id: string;
    mealId: string;
    date: string; // YYYY-MM-DD format
    createdAt: Date;
}

// Update the meals state to include date assignments
export interface MealsState {
    meals: Meal[];
    dateMeals: DateMeal[]; // New field for date-based assignments
}

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
            !Object.values(MealType).includes(meal.mealType) ||
            !meal.date ||
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
            return { meals: [], dateMeals: [] };
        } // Convert createdAt and date strings back to Date objects
        if (parsedMeals.meals) {
            parsedMeals.meals = parsedMeals.meals.map((meal: any) => ({
                ...meal,
                date: new Date(meal.date),
                createdAt: new Date(meal.createdAt),
            }));
        }

        if (isValidMealsState(parsedMeals)) {
            return parsedMeals;
        } else {
            console.warn(
                "Stored meals data failed validation. Discarding invalid data."
            );
            localStorage.removeItem("meals");
            return { meals: [], dateMeals: [] };
        }
    }
    return { meals: [], dateMeals: [] };
}

// Helper function to generate unique ID
function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
        mealType: MealType,
        date: Date = new Date()
    ): string {
        const id = generateId();
        const newMeal: Meal = {
            id,
            name: name.trim(),
            description: description.trim(),
            mealType,
            date,
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
        const mealIndex = state.meals.findIndex((meal) => meal.id === id);
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
        if (updates.mealType !== undefined) {
            state.meals[mealIndex].mealType = updates.mealType;
        }
        if (updates.date !== undefined) {
            state.meals[mealIndex].date = updates.date;
        }

        return true;
    }

    // Action to delete a meal
    function deleteMeal(id: string): boolean {
        const mealIndex = state.meals.findIndex((meal) => meal.id === id);
        if (mealIndex === -1) {
            return false;
        }
        state.meals.splice(mealIndex, 1);
        return true;
    }

    // Action to get a meal by ID
    function getMealById(id: string): Meal | undefined {
        return state.meals.find((meal) => meal.id === id);
    }

    // Action to get meals by type
    function getMealsByType(mealType: MealType): Meal[] {
        return state.meals.filter((meal) => meal.mealType === mealType);
    }

    // Action to get all meals sorted by creation date (newest first)
    function getAllMeals(): Meal[] {
        return [...state.meals].sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );
    }
    // Action to get meals by date
    function getMealsByDate(date: Date): Meal[] {
        const targetDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );
        return state.meals.filter((meal) => {
            const mealDate = new Date(
                meal.date.getFullYear(),
                meal.date.getMonth(),
                meal.date.getDate()
            );
            return mealDate.getTime() === targetDate.getTime();
        });
    }

    // Action to get meals within a date range
    function getMealsByDateRange(startDate: Date, endDate: Date): Meal[] {
        return state.meals
            .filter((meal) => {
                const mealDate = new Date(
                    meal.date.getFullYear(),
                    meal.date.getMonth(),
                    meal.date.getDate()
                );
                const start = new Date(
                    startDate.getFullYear(),
                    startDate.getMonth(),
                    startDate.getDate()
                );
                const end = new Date(
                    endDate.getFullYear(),
                    endDate.getMonth(),
                    endDate.getDate()
                );
                return mealDate >= start && mealDate <= end;
            })
            .sort((a, b) => a.date.getTime() - b.date.getTime());
    }
    // Action to get all meals sorted by date (oldest first)
    function getAllMealsSortedByDate(): Meal[] {
        return [...state.meals].sort(
            (a, b) => a.date.getTime() - b.date.getTime()
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
        getMealsByDate,
        getMealsByDateRange,
        getAllMealsSortedByDate,

        // Getters
        mealCount,
    };
});
