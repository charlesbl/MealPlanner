import { MealType, useMealStore } from "@/stores/mealStore";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

// Schema for reading meals with optional filtering
const readMealsSchema = z.object({
    mealType: z
        .nativeEnum(MealType)
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

export const ReadMealsTool = new DynamicStructuredTool({
    name: "read_meals",
    description: `Reads all meals from the deck or filters by meal type. Valid meal types are: ${Object.values(
        MealType
    ).join(
        ", "
    )}. Returns meals sorted by creation date (newest first). Meals are stored without specific dates and can be reused in weekly selections.`,
    schema: readMealsSchema,
    func: async (input: z.infer<typeof readMealsSchema>): Promise<string> => {
        const mealStore = useMealStore();
        try {
            let meals = input.mealType
                ? mealStore.getMealsByType(input.mealType)
                : mealStore.getAllMeals();

            if (input.limit && input.limit > 0) {
                meals = meals.slice(0, input.limit);
            }

            if (meals.length === 0) {
                const filterText = input.mealType
                    ? ` for ${input.mealType}`
                    : "";
                return `No meals found${filterText} in your deck.`;
            }

            // Format output for better readability
            let output = `Found ${meals.length} meal${
                meals.length > 1 ? "s" : ""
            } in your deck`;
            if (input.mealType) {
                output += ` (${input.mealType})`;
            }
            output += ":\n\n";

            meals.forEach((meal, index) => {
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
