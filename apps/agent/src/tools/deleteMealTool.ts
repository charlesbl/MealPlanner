import { DynamicStructuredTool } from "@langchain/core/tools";
import * as mealService from "@mealplanner/shared-all";
import { z } from "zod";
import { AgentTool } from "./types.js";

const deleteMealSchema = z.object({
    mealId: z.string().describe("The ID of the meal to delete"),
});

export const getDeleteMealTool = (
    token: string
): AgentTool<typeof deleteMealSchema> => {
    return {
        schema: deleteMealSchema,
        getToolUpdateEventOnToolEnd: (input) => ({
            type: "deleteMeal",
            mealId: input.mealId,
        }),
        tool: new DynamicStructuredTool({
            name: "delete_meal",
            description: "Deletes a meal by its ID.",
            schema: deleteMealSchema,
            func: async (input): Promise<string> => {
                try {
                    await mealService.deleteMeal(input.mealId, token);
                    return `Successfully deleted meal with ID: '${input.mealId}'.`;
                } catch (error: any) {
                    console.error("Error in deleteMealTool:", error);
                    return `Error deleting meal: ${error.message}`;
                }
            },
        }),
    };
};
