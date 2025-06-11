import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from 'zod';
import { useMealStore } from '@/stores/mealStore';

const deleteMealSchema = z.object({
    mealId: z.string().describe("The ID of the meal to delete"),
});

export const DeleteMealTool = new DynamicStructuredTool({
  name: "delete_meal",
  description: "Deletes a meal by its ID.",
  schema: deleteMealSchema,
  func: async (input: z.infer<typeof deleteMealSchema>): Promise<string> => {
    const mealStore = useMealStore();
    try {
      const mealToDelete = mealStore.getMealById(input.mealId);
      if (!mealToDelete) {
        return `Error: Could not find meal with ID '${input.mealId}' to delete.`;
      }
      
      const success = mealStore.deleteMeal(input.mealId);
      if (success) {
        return `Successfully deleted meal: '${mealToDelete.name}' (${mealToDelete.mealType}).`;
      } else {
        return `Error: Could not delete meal with ID '${input.mealId}'.`;
      }
    } catch (error: any) {
      console.error("Error in deleteMealTool:", error);
      return `Error deleting meal: ${error.message}`;
    }
  }
});
