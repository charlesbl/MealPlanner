import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { AgentTool } from "./types.js";

const removeMealFromWeekSchema = z.object({
    mealId: z
        .string()
        .describe("The ID of the meal to remove from the weekly selection"),
});

// TODO: Remplacer par appel API semaine quand disponible
export const getRemoveMealFromWeekTool = (
    token: string
): AgentTool<typeof removeMealFromWeekSchema> => {
    return {
    schema: removeMealFromWeekSchema,
        tool: new DynamicStructuredTool({
            name: "remove_meal_from_week",
            description:
                "Removes a meal from the current weekly selection. The meal will remain in your deck and can be added back later.",
            schema: removeMealFromWeekSchema,
            func: async (
                input: z.infer<typeof removeMealFromWeekSchema>
            ): Promise<string> => {
                try {
                    // TODO: Appel API pour retirer le meal de la semaine avec le token
                    return `Meal with ID '${input.mealId}' removed from the week (API call to be implemented).`;
                } catch (error: any) {
                    console.error("Error in removeMealFromWeekTool:", error);
                    return `Error removing meal from week: ${error.message}`;
                }
            },
        }),
    };
};
