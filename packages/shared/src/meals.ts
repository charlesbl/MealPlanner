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
