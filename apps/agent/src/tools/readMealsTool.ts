import { DynamicStructuredTool } from "@langchain/core/tools";
import { MealType } from "@mealplanner/shared";
import { z } from "zod";
import * as mealService from "../../../../packages/shared/src/mealService.js";
import type { Meal } from "../../../../packages/shared/src/schemas/meal.schemas.js";

const readMealsSchema = z.object({
    mealType: z
        .enum(MealType)
        .optional()
        .describe(
            `Optional meal type filter (${Object.values(MealType).join(" | ")})`
        ),
    limit: z
        .number()
        .optional()
        .describe(
            "Optional limit on number of meals to return (default: all meals)"
        ),
});

const mealTypeDescription = Object.values(MealType).join(", ");

export const getReadMealsTool = (token: string) => {
    return new DynamicStructuredTool({
        name: "read_meals",
        description: `Reads all meals from the deck or filters by meal type. Valid meal types are: ${mealTypeDescription}. Returns meals sorted by creation date (newest first). Meals are stored without specific dates and can be reused in weekly selections`,
        schema: readMealsSchema,
        func: async (
            input: z.infer<typeof readMealsSchema>
        ): Promise<string> => {
            try {
                const meals = await mealService.fetchMeals(token);

                let filteredMeals = input.mealType
                    ? meals.filter((m: Meal) =>
                          m.mealTypes.includes(input.mealType!)
                      )
                    : meals;

                if (input.limit && input.limit > 0) {
                    filteredMeals = filteredMeals.slice(0, input.limit);
                }

                if (filteredMeals.length === 0) {
                    const filterText = input.mealType
                        ? ` for ${input.mealType}`
                        : "";
                    return `No meals found${filterText} in your deck.`;
                }

                // Format output for better readability
                let output = `Found ${filteredMeals.length} meal${
                    filteredMeals.length > 1 ? "s" : ""
                } in your deck`;
                if (input.mealType) {
                    output += ` (${input.mealType})`;
                }
                output += ":\n\n";

                filteredMeals.forEach((meal: Meal, index: number) => {
                    output += `${index + 1}. **${meal.name}** (${
                        meal.mealTypes
                    })\n`;
                    output += `   ID: ${meal.id}\n`;
                    if (meal.description) {
                        output += `   Description: ${meal.description}\n`;
                    }
                    output += `   Added: ${meal.createdAt.toLocaleDateString()}\n\n`;
                });

                return output;
            } catch (error: any) {
                console.error("Error in readMealsTool:", error);
                return `Error reading meals: ${error.message}`;
            }
        },
    });
};
