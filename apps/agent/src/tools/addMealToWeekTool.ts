import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

const addMealToWeekSchema = z.object({
    mealId: z
        .string()
        .describe("The ID of the meal to add to the weekly selection"),
});

// TODO: Remplacer par appel API semaine quand disponible
export const getAddMealToWeekTool = (token: string) => {
    return new DynamicStructuredTool({
        name: "add_meal_to_week",
        description:
            "Adds a meal from the deck to the current weekly selection. The meal will be available in the week view for meal planning.",
        schema: addMealToWeekSchema,
        func: async (
            input: z.infer<typeof addMealToWeekSchema>
        ): Promise<string> => {
            try {
                // TODO: Appel API pour ajouter le meal à la semaine avec le token
                return `Meal with ID '${input.mealId}' added to the week (API call to be implemented).`;
            } catch (error: any) {
                console.error("Error in addMealToWeekTool:", error);
                return `Error adding meal to week: ${error.message}`;
            }
        },
    });
};
