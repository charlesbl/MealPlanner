import { DynamicStructuredTool } from "@langchain/core/tools";
import * as libraryService from "@mealplanner/shared-all";
import { MealType } from "@mealplanner/shared-all";
import { z } from "zod";
import { AgentTool } from "./types.js";

const addOrUpdateMealSchema = z.object({
    mealName: z.string().describe("The name of the meal to add or update"),
    description: z
        .string()
        .describe("Description, ingredients, or notes about the meal"),
    mealTypes: z
        .array(z.enum(MealType))
        .min(1, "At least one meal type is required"),
    mealId: z
        .string()
        .optional()
        .describe(
            "Optional meal ID for updating an existing meal (leave empty to add new meal)"
        ),
});

export const getAddOrUpdateMealTool = (
    token: string
): AgentTool<typeof addOrUpdateMealSchema> => {
    return {
        schema: addOrUpdateMealSchema,
        getToolUpdateEventOnToolEnd: (input) => {
            if (input.mealId) {
                return {
                    type: "updateMeal",
                    mealId: input.mealId,
                };
            } else {
                return {
                    type: "updateLibrary",
                };
            }
        },
        tool: new DynamicStructuredTool({
            name: "add_or_update_meal",
            description: `Adds a new meal or updates an existing meal. Valid meal types are: ${Object.values(
                MealType
            ).join(
                ", "
            )}. If mealId is provided, the existing meal will be updated; otherwise, a new meal will be created.`,
            schema: addOrUpdateMealSchema,
            func: async (
                input: z.infer<typeof addOrUpdateMealSchema>
            ): Promise<string> => {
                try {
                    if (input.mealId) {
                        // Update existing meal via API
                        const updated = await libraryService.updateMeal(
                            input.mealId,
                            {
                                name: input.mealName,
                                description: input.description,
                                mealTypes: input.mealTypes,
                            },
                            token
                        );
                        return `Successfully updated '${updated.name}' (${updated.mealTypes}).`;
                    } else {
                        // Add new meal via API
                        const created = await libraryService.addMeal(
                            {
                                name: input.mealName,
                                description: input.description,
                                mealTypes: input.mealTypes,
                            },
                            token
                        );
                        return `Successfully added new ${created.mealTypes} meal: '${created.name}'. Meal ID: ${created.id}. You can now add this meal to your plan or manage it in your library.`;
                    }
                } catch (error: any) {
                    console.error("Error in addOrUpdateMealTool:", error);
                    return `Error managing meal: ${error.message}`;
                }
            },
        }),
    };
};
