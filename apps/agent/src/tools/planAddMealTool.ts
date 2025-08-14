import { DynamicStructuredTool } from "@langchain/core/tools";
import { planService } from "@mealplanner/shared-all";
import { z } from "zod";
import { AgentTool } from "./types.js";

const addMealToPlanSchema = z.object({
    mealId: z.string().describe("The ID of the meal to add to the plan"),
});

export const getAddMealToPlanTool = (
    token: string
): AgentTool<typeof addMealToPlanSchema> => {
    return {
        schema: addMealToPlanSchema,
        getToolUpdateEventOnToolEnd: () => ({
            type: "updatePlan",
        }),
        tool: new DynamicStructuredTool({
            name: "add_meal_to_plan",
            description: "Adds a meal from the library to the current plan.",
            schema: addMealToPlanSchema,
            func: async (
                input: z.infer<typeof addMealToPlanSchema>
            ): Promise<string> => {
                try {
                    // Determine next order based on current plan length
                    const current = await planService.fetchPlan(token);
                    const created = await planService.addToPlan(
                        { mealId: input.mealId, order: current.length },
                        token
                    );
                    return `Added '${
                        created.meal.name
                    }' to the plan at position ${
                        (created.order ?? current.length) + 1
                    }. Meal ID: ${created.meal.id}. PlanItemId: ${created.id}.`;
                } catch (error: any) {
                    console.error("Error in addMealToPlanTool:", error);
                    return `Error adding meal to plan: ${error.message}`;
                }
            },
        }),
    };
};
