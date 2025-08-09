import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { mealStore, weekStore } from "../state.js";

// Schema for removing a meal from the week
const removeMealFromWeekSchema = z.object({
    mealId: z
        .string()
        .describe("The ID of the meal to remove from the weekly selection"),
});

export const RemoveMealFromWeekTool = new DynamicStructuredTool({
    name: "remove_meal_from_week",
    description:
        "Removes a meal from the current weekly selection. The meal will remain in your deck and can be added back later.",
    schema: removeMealFromWeekSchema,
    func: async (
        input: z.infer<typeof removeMealFromWeekSchema>
    ): Promise<string> => {
        try {
            // Get the meal details for better messaging
            const meal = mealStore.getMealById(input.mealId);
            const mealName = meal ? meal.name : `meal with ID ${input.mealId}`;
            const mealType = meal ? meal.mealTypes : "";

            // Check if meal is in the week
            if (!weekStore.isMealInWeek(input.mealId)) {
                return `${mealName} is not currently in your weekly selection.`;
            }

            // Remove the meal from the week
            const success = weekStore.removeMealFromWeek(input.mealId);

            if (success) {
                const typeText = mealType ? ` (${mealType})` : "";
                return `Successfully removed '${mealName}'${typeText} from your weekly selection. You now have ${weekStore.selectedMealCount()} meals selected for the week.`;
            } else {
                return `Error: Could not remove '${mealName}' from your weekly selection.`;
            }
        } catch (error: any) {
            console.error("Error in removeMealFromWeekTool:", error);
            return `Error removing meal from week: ${error.message}`;
        }
    },
});
