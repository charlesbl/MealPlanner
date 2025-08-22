import { DynamicStructuredTool } from "@langchain/core/tools";
import { planService } from "@mealplanner/shared-all";
import { z } from "zod";
import { AgentTool } from "./types.js";

const addMealSchema = z.object({
    recipeId: z
        .string()
        .describe("The ID of the recipe to add to the plan as a meal"),
});

export const getAddMealTool = (
    token: string
): AgentTool<typeof addMealSchema> => {
    return {
        schema: addMealSchema,
        getToolUpdateEventOnToolEnd: () => ({
            type: "updatePlan",
        }),
        tool: new DynamicStructuredTool({
            name: "add_meal",
            description:
                "Adds a recipe from the library to the current plan as a meal.",
            schema: addMealSchema,
            func: async (
                input: z.infer<typeof addMealSchema>
            ): Promise<string> => {
                try {
                    // Determine next order based on current plan length
                    const current = await planService.fetchPlan(token);
                    const created = await planService.addToPlan(
                        { recipeId: input.recipeId, order: current.length },
                        token
                    );
                    return `Added '${
                        created.recipe.name
                    }' to the plan at position ${
                        (created.order ?? current.length) + 1
                    }. Recipe ID: ${created.recipe.id}. MealId: ${created.id}.`;
                } catch (error: any) {
                    console.error("Error in addMealTool:", error);
                    return `Error adding recipe to plan: ${error.message}`;
                }
            },
        }),
    };
};
