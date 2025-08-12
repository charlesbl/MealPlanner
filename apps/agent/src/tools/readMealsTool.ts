import { DynamicStructuredTool } from "@langchain/core/tools";
import type { Meal } from "@mealplanner/shared-all";
import * as mealService from "@mealplanner/shared-all";
import { MealType } from "@mealplanner/shared-all";
import { z } from "zod";
import { AgentTool } from "./types.js";

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

export const getReadMealsTool = (
    token: string
): AgentTool<typeof readMealsSchema> => {
    return {
        schema: readMealsSchema,
        tool: new DynamicStructuredTool({
            name: "read_meals",
            description: `Reads all meals from the deck or filters by meal type. Valid meal types are: ${mealTypeDescription}. Returns meals sorted by creation date (newest first). Meals are stored without specific dates and can be reused in weekly selections`,
            schema: readMealsSchema,
            func: async (input): Promise<string> => {
                console.log(
                    `Executing readMealsTool with input: ${JSON.stringify(
                        input
                    )}`
                );
                try {
                    console.log(`Fetching meals with token: ${token}`);
                    const meals = await mealService.fetchMeals(token);
                    console.log(`Fetched ${meals.length} meals`);

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
                        console.log(`No meals found${filterText} in the deck.`);
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

                    console.log(
                        `Read meals tool executed with input: ${JSON.stringify(
                            input
                        )}`
                    );
                    return output;
                } catch (error: any) {
                    console.error("Error in readMealsTool:", error);
                    return `Error reading meals: ${error.message}`;
                }
            },
        }),
    };
};
