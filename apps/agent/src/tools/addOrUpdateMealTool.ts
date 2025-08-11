import { DynamicStructuredTool } from "@langchain/core/tools";
import { MealType } from "@mealplanner/shared";
import { z } from "zod";
import * as mealService from "../../../../packages/shared/src/mealService.js";

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

export const getAddOrUpdateMealTool = (token: string) => {
    return new DynamicStructuredTool({
        name: "add_or_update_meal",
        description: `Adds a new meal or updates an existing meal. Valid meal types are: ${Object.values(
            MealType
        ).join(
            ", "
        )}. If mealId is provided, the existing meal will be updated; otherwise, a new meal will be created. Meals are now stored without specific dates and can be reused in weekly selections.`,
        schema: addOrUpdateMealSchema,
        func: async (
            input: z.infer<typeof addOrUpdateMealSchema>
        ): Promise<string> => {
            try {
                if (input.mealId) {
                    // Update existing meal via API
                    const updated = await mealService.updateMeal(
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
                    const created = await mealService.addMeal(
                        {
                            name: input.mealName,
                            description: input.description,
                            mealTypes: input.mealTypes,
                        },
                        token
                    );
                    return `Successfully added new ${created.mealTypes} meal: '${created.name}'. Meal ID: ${created.id}. You can now add this meal to your weekly selection or manage it in your deck.`;
                }
            } catch (error: any) {
                console.error("Error in addOrUpdateMealTool:", error);
                return `Error managing meal: ${error.message}`;
            }
        },
    });
};
