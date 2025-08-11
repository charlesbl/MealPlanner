import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import * as mealService from "../../../../packages/shared/src/mealService.js";

const deleteMealSchema = z.object({
    mealId: z.string().describe("The ID of the meal to delete"),
});

export const getDeleteMealTool = (token: string) => {
    return new DynamicStructuredTool({
        name: "delete_meal",
        description: "Deletes a meal by its ID.",
        schema: deleteMealSchema,
        func: async (
            input: z.infer<typeof deleteMealSchema>
        ): Promise<string> => {
            try {
                await mealService.deleteMeal(input.mealId, token);
                return `Successfully deleted meal with ID: '${input.mealId}'.`;
            } catch (error: any) {
                console.error("Error in deleteMealTool:", error);
                return `Error deleting meal: ${error.message}`;
            }
        },
    });
};
