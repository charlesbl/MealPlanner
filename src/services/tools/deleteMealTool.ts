import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from 'zod';
import { useMealStore, MealSlot } from '@/stores/mealStore';

const deleteMealSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format").describe("The date of the meal to delete (YYYY-MM-DD)"),
    slot: z.nativeEnum(MealSlot).describe(`The meal slot to delete (${Object.values(MealSlot).join(' | ')})`),
});

export const DeleteMealTool = new DynamicStructuredTool({
  name: "delete_meal",
  description: `Deletes a meal for a specific date and meal slot. Valid slots are: ${Object.values(MealSlot).join(', ')}. Date must be in YYYY-MM-DD format.`,
  schema: deleteMealSchema,
  func: async (input: z.infer<typeof deleteMealSchema>): Promise<string> => {
    const mealStore = useMealStore();
    try {
      // Pass null to setMeal to delete the meal entry
      mealStore.setMeal(input.date, input.slot, null);
      return `Successfully deleted meal for ${input.slot} on ${input.date}.`;
    } catch (error: any) {
      console.error("Error in deleteMealTool:", error);
      return `Error deleting meal: ${error.message}`;
    }
  }
});
