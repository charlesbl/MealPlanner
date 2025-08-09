import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { mealStore, weekStore } from "../state.js";

// Schema for adding a meal to the week
const addMealToWeekSchema = z.object({
    mealId: z
        .string()
        .describe("The ID of the meal to add to the weekly selection"),
});

export const AddMealToWeekTool = new DynamicStructuredTool({
    name: "add_meal_to_week",
    description:
        "Adds a meal from the deck to the current weekly selection. The meal will be available in the week view for meal planning.",
    schema: addMealToWeekSchema,
    func: async (
        input: z.infer<typeof addMealToWeekSchema>
    ): Promise<string> => {
        console.log("Adding meal to week:", input);
        try {
            // Verify the meal exists
            const meal = mealStore.getMealById(input.mealId);
            if (!meal) {
                console.warn(
                    `No meal found with ID '${input.mealId}'. Please check the meal ID and try again.`
                );
                return `Error: No meal found with ID '${input.mealId}'. Please check the meal ID and try again.`;
            }

            // Check if meal is already in the week
            if (weekStore.isMealInWeek(input.mealId)) {
                console.warn(
                    `Meal '${meal.name}' (${meal.mealTypes}) is already in your weekly selection.`
                );
                return `'${meal.name}' (${meal.mealTypes}) is already in your weekly selection.`;
            }

            // Add the meal to the week
            weekStore.addMealToWeek(input.mealId);

            return `Successfully added '${meal.name}' (${
                meal.mealTypes
            }) to your weekly selection. You now have ${weekStore.selectedMealCount()} meals selected for the week.`;
        } catch (error: any) {
            console.error("Error in addMealToWeekTool:", error);
            return `Error adding meal to week: ${error.message}`;
        }
    },
});
