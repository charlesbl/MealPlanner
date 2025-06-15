import { MealType } from "@/stores/mealStore";
import { useMealTypeFilterStore } from "@/stores/mealTypeFilterStore";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

// Schema for setting meal type filter
const setMealTypeFilterSchema = z.object({
    action: z
        .enum([
            "set_meal_type",
            "set_breakfast",
            "set_lunch",
            "set_dinner",
            "set_snacks",
            "clear",
        ])
        .describe("The action to perform on the meal type filter"),
    mealType: z
        .nativeEnum(MealType)
        .optional()
        .describe(
            `Meal type to filter by (required for 'set_meal_type' action). Valid types: ${Object.values(
                MealType
            ).join(", ")}`
        ),
});

export const SetMealTypeFilterTool = new DynamicStructuredTool({
    name: "set_meal_type_filter",
    description: `Sets the meal type filter for meal viewing. Available actions:
- 'set_meal_type': Set filter to specific meal type (requires mealType parameter)
- 'set_breakfast': Filter to show only breakfast meals
- 'set_lunch': Filter to show only lunch meals
- 'set_dinner': Filter to show only dinner meals
- 'set_snacks': Filter to show only snack meals
- 'clear': Remove meal type filter to show all meal types`,
    schema: setMealTypeFilterSchema,
    func: async (
        input: z.infer<typeof setMealTypeFilterSchema>
    ): Promise<string> => {
        const mealTypeFilterStore = useMealTypeFilterStore();

        try {
            switch (input.action) {
                case "set_meal_type":
                    if (!input.mealType) {
                        return "Error: mealType parameter is required for 'set_meal_type' action.";
                    }

                    mealTypeFilterStore.setMealType(input.mealType);
                    return `Meal type filter set to ${input.mealType}. Now showing only ${input.mealType} meals.`;

                case "set_breakfast":
                    mealTypeFilterStore.setBreakfast();
                    return "Meal type filter set to Breakfast. Now showing only breakfast meals.";

                case "set_lunch":
                    mealTypeFilterStore.setLunch();
                    return "Meal type filter set to Lunch. Now showing only lunch meals.";

                case "set_dinner":
                    mealTypeFilterStore.setDinner();
                    return "Meal type filter set to Dinner. Now showing only dinner meals.";

                case "set_snacks":
                    mealTypeFilterStore.setSnacks();
                    return "Meal type filter set to Snacks. Now showing only snack meals.";

                case "clear":
                    mealTypeFilterStore.clearFilter();
                    return "Meal type filter cleared. Now showing all meal types.";

                default:
                    return `Error: Unknown action '${input.action}'. Valid actions are: set_meal_type, set_breakfast, set_lunch, set_dinner, set_snacks, clear.`;
            }
        } catch (error: any) {
            console.error("Error in setMealTypeFilterTool:", error);
            return `Error setting meal type filter: ${error.message}`;
        }
    },
});
