import { defineStore } from 'pinia';
import { reactive, watch } from 'vue'; // Import watch

// Define the enum for meal slots
export enum MealSlot {
  Breakfast = 'Breakfast',
  Lunch = 'Lunch',
  Dinner = 'Dinner',
  Snack = 'Snack' // Added Snack as an example, adjust as needed
}

// Define the structure for a meal entry using the enum and a mapped type
export interface Meal extends Partial<Record<MealSlot, string>> {} // Use Partial<Record<MealSlot, string>>

// Define the structure for the meals state
export interface MealsState {
  [date: string]: Meal; // e.g., { '2024-05-10': { Breakfast: '...' } }
}

// Helper function to load meals from localStorage
function loadMealsFromLocalStorage(): MealsState {
  const storedMeals = localStorage.getItem('meals');
  if (storedMeals) {
    try {
      return JSON.parse(storedMeals);
    } catch (e) {
      console.error("Error parsing meals from localStorage", e);
      // Return empty object if parsing fails
      return {};
    }
  }
  return {}; // Return empty object if nothing is stored
}

export const useMealStore = defineStore('mealStore', () => {
  // --- State ---
  // Initialize state from localStorage
  const meals = reactive<MealsState>(loadMealsFromLocalStorage());

  // --- Watch for changes and save to localStorage ---
  watch(meals, (newMeals) => {
    localStorage.setItem('meals', JSON.stringify(newMeals));
  }, { deep: true }); // Use deep watch to detect nested changes


  // --- Actions ---

  // Action to add or update a meal, using MealSlot for the slot parameter
  function setMeal(date: string, slot: MealSlot, mealName: string) {
    const trimmedName = mealName.trim();

    if (!meals[date]) {
      // Ensure the date entry exists if we are adding a meal
      if (trimmedName !== '') {
        // Initialize with an empty object, type assertion is not strictly needed
        // but can be kept for clarity if preferred.
        meals[date] = {};
      } else {
        // Don't create an entry if the name is empty
        return;
      }
    }

    if (trimmedName === '') {
      // Delete meal if input is empty
      delete meals[date][slot];
      // Clean up empty date entry
      if (Object.keys(meals[date]).length === 0) {
        delete meals[date];
      }
    } else {
      // Add or update meal
      meals[date][slot] = trimmedName;
    }
  }

  // Action to get a meal for a specific date and slot, using MealSlot
  function getMeal(date: string, slot: MealSlot): string | undefined {
    return meals[date]?.[slot];
  }

  // Action to get meals for a specific date range
  function getMealsForPeriod(startDate: string, endDate: string): MealsState {
    const result: MealsState = {};
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Ensure dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error("Invalid date format provided to getMealsForPeriod");
      return {};
    }

    // Normalize end date to include the whole day
    end.setHours(23, 59, 59, 999);

    Object.keys(meals).forEach(dateStr => {
      const currentDate = new Date(dateStr);
      // Ensure dateStr is valid before comparison
      if (!isNaN(currentDate.getTime()) && currentDate >= start && currentDate <= end) {
        result[dateStr] = meals[dateStr];
      }
    });
    return result;
  }

  // --- Getters ---
  // (Optional: Add getters if needed for computed properties based on meals state)

  return {
    meals,
    setMeal,
    getMeal,
    getMealsForPeriod, // Expose the new function
  };
});
