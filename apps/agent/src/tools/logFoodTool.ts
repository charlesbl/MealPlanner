import { DynamicStructuredTool } from "@langchain/core/tools";
import {
    journalService,
    MealType,
    MealTypeSchema,
} from "@mealplanner/shared-all";
import { z } from "zod";
import { estimateNutrition } from "../utils/estimateNutrition.js";
import { AgentTool } from "./types.js";

const logFoodSchema = z.object({
    description: z
        .string()
        .describe(
            "Description of the food or meal consumed, as given by the user",
        ),
    date: z
        .string()
        .describe(
            "Date of consumption in YYYY-MM-DD format (default to today)",
        ),
    mealType: MealTypeSchema.describe(
        "Meal type inferred from context: breakfast, lunch, dinner, or snack",
    ),
});

export const getLogFoodTool = (
    token: string,
): AgentTool<typeof logFoodSchema> => {
    return {
        schema: logFoodSchema,
        getToolUpdateEventOnToolEnd: (input) => ({
            type: "updateJournal",
            date: input.date,
        }),
        tool: new DynamicStructuredTool({
            name: "log_food",
            description:
                "Logs a food or meal consumed by the user in their food journal. Use this tool when the user mentions having eaten something. Calories and macronutrients are estimated automatically from the description.",
            schema: logFoodSchema,
            func: async (
                input: z.infer<typeof logFoodSchema>,
            ): Promise<string> => {
                try {
                    const nutrition = await estimateNutrition(
                        input.description,
                    );
                    const entry = await journalService.createFoodEntry(
                        {
                            description: input.description,
                            date: input.date,
                            mealType: input.mealType as MealType,
                            nutrition,
                        },
                        token,
                    );
                    const { calories, protein, carbs, fat } = entry.nutrition;
                    return `Logged: ${entry.description} — ${calories} kcal, P: ${protein}g, C: ${carbs}g, F: ${fat}g`;
                } catch (error: any) {
                    console.error("Error in logFoodTool:", error);
                    return `Error logging food entry: ${error.message}`;
                }
            },
        }),
    };
};
