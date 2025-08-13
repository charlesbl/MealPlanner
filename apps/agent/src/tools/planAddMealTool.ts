import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { AgentTool } from "./types.js";

const addMealToPlanSchema = z.object({
    mealId: z.string().describe("The ID of the meal to add to the plan"),
});

// TODO: Remplacer par appel API semaine quand disponible
export const getAddMealToPlanTool = (
    token: string
): AgentTool<typeof addMealToPlanSchema> => {
    return {
        schema: addMealToPlanSchema,
        tool: new DynamicStructuredTool({
            name: "add_meal_to_plan",
            description:
                "Adds a meal from the library to the current plan. The meal will be available in the plan view for meal planning.",
            schema: addMealToPlanSchema,
            func: async (
                input: z.infer<typeof addMealToPlanSchema>
            ): Promise<string> => {
                try {
                    // TODO: Appel API pour ajouter le meal à la semaine avec le token
                    return `Meal with ID '${input.mealId}' added to the plan (API call to be implemented).`;
                } catch (error: any) {
                    console.error("Error in addMealToPlanTool:", error);
                    return `Error adding meal to plan: ${error.message}`;
                }
            },
        }),
    };
};
