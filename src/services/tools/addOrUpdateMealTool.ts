import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from 'zod';
import { useMealStore, MealType } from '@/stores/mealStore';

// Schema for adding or updating a meal
const addOrUpdateMealSchema = z.object({
    mealName: z.string().describe("The name of the meal to add or update"),
    description: z.string().describe("Description, ingredients, or notes about the meal"),
    mealType: z.nativeEnum(MealType).describe(`The meal type (${Object.values(MealType).join(' | ')})`),
    date: z.string().optional().describe("Optional date for the meal in YYYY-MM-DD format (defaults to today if not provided)"),
    mealId: z.string().optional().describe("Optional meal ID for updating an existing meal (leave empty to add new meal)"),
});

export const AddOrUpdateMealTool = new DynamicStructuredTool({
  name: "add_or_update_meal",
  description: `Adds a new meal or updates an existing meal. Valid meal types are: ${Object.values(MealType).join(', ')}. If mealId is provided, the existing meal will be updated; otherwise, a new meal will be created.`,
  schema: addOrUpdateMealSchema,  func: async (input: z.infer<typeof addOrUpdateMealSchema>): Promise<string> => {
    const mealStore = useMealStore();
    try {
      const mealDate = input.date ? new Date(input.date) : new Date();
      
      if (input.mealId) {
        // Update existing meal
        const success = mealStore.updateMeal(input.mealId, {
          name: input.mealName,
          description: input.description,
          mealType: input.mealType,
          date: mealDate,
        });
        
        if (success) {
          return `Successfully updated '${input.mealName}' (${input.mealType}) for ${mealDate.toDateString()}.`;
        } else {
          return `Error: Could not find meal with ID '${input.mealId}' to update.`;
        }
      } else {
        // Add new meal
        const newMealId = mealStore.addMeal(input.mealName, input.description, input.mealType, mealDate);
        return `Successfully added new ${input.mealType} meal: '${input.mealName}' for ${mealDate.toDateString()}. Meal ID: ${newMealId}`;
      }
    } catch (error: any) {
      console.error("Error in addOrUpdateMealTool:", error);
      return `Error managing meal: ${error.message}`;
    }
  }
});
