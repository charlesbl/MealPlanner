import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from 'zod';
import { useMealStore, MealSlot } from '@/stores/mealStore';
import type { Meal } from '@/stores/mealStore';

// Update schema to include optional recipe and macros directly
const addOrUpdateMealSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format").describe("The date for the meal (YYYY-MM-DD)"),
    slot: z.nativeEnum(MealSlot).describe(`The meal slot (${Object.values(MealSlot).join(' | ')})`),
    mealName: z.string().describe("The name of the meal to add or update"),
    recipe: z.string().optional().describe("Optional recipe details or instructions"),
    calories: z.number().optional().describe("Estimated calories"),
    protein: z.number().optional().describe("Estimated protein in grams"),
    carbs: z.number().optional().describe("Estimated carbohydrates in grams"),
    fat: z.number().optional().describe("Estimated fat in grams"),
});

export const AddOrUpdateMealTool = new DynamicStructuredTool({
  name: "add_or_update_meal",
  description: `Adds a new meal or updates an existing meal for a specific date and meal slot. Including recipe and macros is highly recommended. Valid slots are: ${Object.values(MealSlot).join(', ')}. Date must be in YYYY-MM-DD format.`,
  schema: addOrUpdateMealSchema,
  func: async (input: z.infer<typeof addOrUpdateMealSchema>): Promise<string> => {
    const mealStore = useMealStore();
    try {
      // Create the Meal object including optional fields
      const mealToAdd: Meal = {
        name: input.mealName,
        recipe: input.recipe, // Pass recipe if provided
        macros: (input.calories || input.protein || input.carbs || input.fat) ? {
          calories: input.calories,
          protein: input.protein,
          carbs: input.carbs,
          fat: input.fat,
        } : undefined,
      };
      mealStore.setMeal(input.date, input.slot, mealToAdd);
      let responseMessage = `Successfully set '${input.mealName}' for ${input.slot} on ${input.date}.`;
      if (input.recipe) responseMessage += ` Recipe added.`;
      if (mealToAdd.macros) responseMessage += ` Macros added.`;
      return responseMessage;
    } catch (error: any) {
      console.error("Error in addOrUpdateMealTool:", error);
      return `Error setting meal: ${error.message}`;
    }
  }
});
