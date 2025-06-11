import { defineStore } from 'pinia';
import { reactive, watch } from 'vue'; // Import watch

// Define the enum for meal slots
export enum MealSlot {
  Lunch = 'Lunch',
  Dinner = 'Dinner',
}
const validSlots = Object.values(MealSlot); // Cache valid slots

// Define the Meal interface
export interface Meal { // Add export
  name: string;
  recipe?: string; // Recipe is optional
  macros?: { // Macros are optional
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

// Define the structure for a meal entry using the enum and a mapped type
export interface DayMeals extends Partial<Record<MealSlot, Meal>> {} // Use Partial<Record<MealSlot, Meal>>

// Define the structure for the meals state
export interface MealsState {
  [date: string]: DayMeals; // e.g., { '2024-05-10': { Breakfast: { name: 'Oatmeal', ... } } }
}

// Helper function to validate the loaded meals data
function isValidMealsState(data: any): data is MealsState {
  if (typeof data !== 'object' || data === null) {
    console.warn("Invalid meals data: not an object.");
    return false;
  }

  for (const dateKey in data) {
    // Basic check if the key looks like a date (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      console.warn(`Invalid meals data: invalid date key format "${dateKey}".`);
      return false;
    }

    const dayMeals = data[dateKey];
    if (typeof dayMeals !== 'object' || dayMeals === null) {
      console.warn(`Invalid meals data: dayMeals for "${dateKey}" is not an object.`);
      return false;
    }

    for (const slotKey in dayMeals) {
      // Check if the slot key is a valid MealSlot enum value
      if (!validSlots.includes(slotKey as MealSlot)) {
        console.warn(`Invalid meals data: invalid slot key "${slotKey}" for date "${dateKey}".`);
        return false;
      }

      const meal = dayMeals[slotKey];
      // Check if the meal is an object and has a non-empty name property
      if (typeof meal !== 'object' || meal === null || typeof meal.name !== 'string' || meal.name.trim() === '') {
        console.warn(`Invalid meals data: invalid meal structure for slot "${slotKey}" on date "${dateKey}".`, meal);
        return false;
      }
      // Optional: Add more checks for recipe/macros structure if needed
    }
  }

  return true; // Data structure seems valid
}


// Helper function to load meals from localStorage
function loadMealsFromLocalStorage(): MealsState {
  const storedMeals = localStorage.getItem('meals');
  if (storedMeals) {
    let parsedMeals: any;
    try {
      parsedMeals = JSON.parse(storedMeals);
    } catch (e) {
      console.error("Error parsing meals from localStorage", e);
      // If parsing fails, remove the invalid item and return empty
      localStorage.removeItem('meals');
      return {};
    }

    // Validate the parsed data structure
    if (isValidMealsState(parsedMeals)) {
      return parsedMeals; // Return validated data
    } else {
      console.warn("Stored meals data failed validation. Discarding invalid data.");
      // If validation fails, remove the invalid item and return empty
      localStorage.removeItem('meals');
      return {};
    }
  }
  return {}; // Return empty object if nothing is stored
}

export const useMealStore = defineStore('mealStore', () => {
  // --- State ---
  // Initialize state from localStorage (now with validation)
  const meals = reactive<MealsState>(loadMealsFromLocalStorage());

  // --- Watch for changes and save to localStorage ---
  watch(meals, (newMeals) => {
    localStorage.setItem('meals', JSON.stringify(newMeals));
  }, { deep: true }); // Use deep watch to detect nested changes


  // --- Actions ---

  // Action to add or update a meal, accepting a Meal object
  function setMeal(date: string, slot: MealSlot, meal: Meal | null) { // Accept Meal object or null to delete
    if (!meals[date]) {
      // Ensure the date entry exists only if we are adding/updating a meal
      if (meal) {
        meals[date] = {};
      } else {
        // Don't create an entry if the meal is null/empty
        return;
      }
    }

    if (!meal || !meal.name || meal.name.trim() === '') { // Check if meal is null or name is empty
      // Delete meal if input is null or name is empty/whitespace
      delete meals[date][slot];
      // Clean up empty date entry
      if (Object.keys(meals[date]).length === 0) {
        delete meals[date];
      }
    } else {
      // Add or update meal with the provided Meal object
      // Trim the name just in case
      meals[date][slot] = { ...meal, name: meal.name.trim() };
    }
  }

  // Action to get a meal for a specific date and slot, returning a Meal object
  function getMeal(date: string, slot: MealSlot): Meal | undefined {
    return meals[date]?.[slot];
  }

  // Action to get meals for a specific date range (no changes needed here as it works with MealsState)
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
    end.setUTCHours(23, 59, 59, 999);

    Object.keys(meals).forEach(dateStr => {
      try {
        // Attempt to create a date object, ensuring it's valid
        const currentDate = new Date(dateStr);
        if (!isNaN(currentDate.getTime()) && currentDate >= start && currentDate <= end) {
          result[dateStr] = meals[dateStr];
        }
      } catch (e) {
        console.error(`Invalid date key in meals data: ${dateStr}`, e);
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
