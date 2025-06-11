import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from 'zod';
import { useMealStore } from '@/stores/mealStore';
import type { MealsState, Meal } from '@/stores/mealStore';

// --- Define Tool Schemas with Zod ---
const readMealsSchema = z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "startDate must be in YYYY-MM-DD format").describe("The start date of the period (YYYY-MM-DD)"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "endDate must be in YYYY-MM-DD format").describe("The end date of the period (YYYY-MM-DD)"),
});

export const ReadMealsTool = new DynamicStructuredTool({
  name: "read_meals_for_period",
  description: "Reads all meals planned between a start date and an end date. Dates must be in YYYY-MM-DD format.",
  schema: readMealsSchema,
  func: async (input: z.infer<typeof readMealsSchema>): Promise<string> => {
    const mealStore = useMealStore();
    try {
      const meals: MealsState = mealStore.getMealsForPeriod(input.startDate, input.endDate);
      const mealCount = Object.keys(meals).reduce((count, date) => count + Object.keys(meals[date]).length, 0);
      if (mealCount === 0) {
          return "No meals found for this period.";
      }
      // Format output for better readability
      let output = "Meals found:\\n";
      Object.entries(meals).forEach(([date, dayMeals]) => {
          output += `${date}:\\n`;
          // Access meal.name for the output
          Object.entries(dayMeals).forEach(([slot, meal]) => {
              // Explicitly check if meal exists and has a name property
              const typedMeal = meal as Meal | null;
              if (typedMeal && typedMeal.name) {
                output += `  - ${slot}: ${typedMeal.name}\\n`;
                // Future: Could add recipe/macros here if available
                // if (typedMeal.recipe) output += `    Recipe: ${typedMeal.recipe}\\n`;
                // if (typedMeal.macros) output += `    Macros: ${JSON.stringify(typedMeal.macros)}\\n`;
              }
          });
      });
      return output;
    } catch (error: any) {
      console.error("Error in readMealsTool:", error);
      return `Error reading meals: ${error.message}`;
    }
  }
});
