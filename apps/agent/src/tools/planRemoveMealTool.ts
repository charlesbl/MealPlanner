import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { AgentTool } from "./types.js";

const removeMealFromPlanSchema = z.object({
    mealId: z.string().describe("The ID of the meal to remove from the plan"),
});

// TODO: Remplacer par appel API semaine quand disponible
export const getRemoveMealFromPlanTool = (
    token: string
): AgentTool<typeof removeMealFromPlanSchema> => {
    return {
        schema: removeMealFromPlanSchema,
        tool: new DynamicStructuredTool({
            name: "remove_meal_from_plan",
            description:
                "Removes a meal from the current plan. The meal will remain in your library and can be added back later.",
            schema: removeMealFromPlanSchema,
            func: async (
                input: z.infer<typeof removeMealFromPlanSchema>
            ): Promise<string> => {
                try {
                    // TODO: Appel API pour retirer le meal de la semaine avec le token
                    return `Meal with ID '${input.mealId}' removed from the plan (API call to be implemented).`;
                } catch (error: any) {
                    console.error("Error in removeMealFromPlanTool:", error);
                    return `Error removing meal from plan: ${error.message}`;
                }
            },
        }),
    };
};
