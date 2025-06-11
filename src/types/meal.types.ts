
// Types for the Meal Planner application

export interface MealFormData {
  name: string;
  description: string;
  mealType: string;
}

export interface FilterState {
  mealType: string;
  searchTerm: string;
}
