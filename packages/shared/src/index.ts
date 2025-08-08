// Domain types shared across services

// Meals
export enum MealType {
    Breakfast = "Breakfast",
    Lunch = "Lunch",
    Dinner = "Dinner",
    Snacks = "Snacks",
}

export interface Meal {
    id: string;
    name: string;
    description: string;
    mealTypes: MealType[];
    createdAt: Date;
}

export interface MealsState {
    meals: Meal[];
}

// Week selection
export interface WeekMeal {
    id: string;
    mealId: string;
    addedAt: Date;
    order: number;
}

export interface WeekState {
    selectedMeals: WeekMeal[];
}

// Utils
export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
