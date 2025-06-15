import { MealType, useMealStore } from "@/stores/mealStore";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

// Schema for searching meals by date or date range
const searchMealsByDateSchema = z
    .object({
        date: z
            .string()
            .optional()
            .describe("Single date to search for meals in YYYY-MM-DD format"),
        startDate: z
            .string()
            .optional()
            .describe("Start date for date range search in YYYY-MM-DD format"),
        endDate: z
            .string()
            .optional()
            .describe("End date for date range search in YYYY-MM-DD format"),
        mealType: z
            .nativeEnum(MealType)
            .optional()
            .describe(
                `Optional meal type filter (${Object.values(MealType).join(
                    " | "
                )})`
            ),
    })
    .refine((data) => data.date || (data.startDate && data.endDate), {
        message:
            "Either 'date' or both 'startDate' and 'endDate' must be provided",
    });

export const SearchMealsByDateTool = new DynamicStructuredTool({
    name: "search_meals_by_date",
    description: `Search for meals on a specific date or within a date range. Use 'date' for single date search, or 'startDate' and 'endDate' for range search. Optionally filter by meal type. Valid meal types are: ${Object.values(
        MealType
    ).join(", ")}.`,
    schema: searchMealsByDateSchema,
    func: async (
        input: z.infer<typeof searchMealsByDateSchema>
    ): Promise<string> => {
        //slepp 5000
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const mealStore = useMealStore();
        try {
            let meals;
            let searchDescription: string;

            if (input.date) {
                // Single date search
                const searchDate = new Date(input.date);
                meals = mealStore.getMealsByDate(searchDate);
                searchDescription = searchDate.toDateString();
            } else if (input.startDate && input.endDate) {
                // Date range search
                const startDate = new Date(input.startDate);
                const endDate = new Date(input.endDate);

                // Validate date range
                if (startDate > endDate) {
                    return "Error: Start date must be before or equal to end date.";
                }

                meals = mealStore.getMealsByDateRange(startDate, endDate);
                searchDescription = `${startDate.toDateString()} to ${endDate.toDateString()}`;
            } else {
                return "Error: Either 'date' or both 'startDate' and 'endDate' must be provided.";
            }

            if (input.mealType) {
                meals = meals.filter(
                    (meal) => meal.mealType === input.mealType
                );
            }

            if (meals.length === 0) {
                const filterText = input.mealType ? ` (${input.mealType})` : "";
                return `No meals found for ${searchDescription}${filterText}.`;
            }

            // Format output for better readability
            let output = `Found ${meals.length} meal${
                meals.length > 1 ? "s" : ""
            } for ${searchDescription}`;
            if (input.mealType) {
                output += ` (${input.mealType})`;
            }
            output += ":\n\n";

            meals.forEach((meal, index) => {
                output += `${index + 1}. **${meal.name}** (${meal.mealType})\n`;
                output += `   ID: ${meal.id}\n`;
                if (meal.description) {
                    output += `   Description: ${meal.description}\n`;
                }
                output += `   Date: ${meal.date.toLocaleDateString()}\n`;
                output += `   Added: ${meal.createdAt.toLocaleDateString()}\n\n`;
            });

            return output;
        } catch (error: any) {
            console.error("Error in searchMealsByDateTool:", error);
            return `Error searching meals by date: ${error.message}`;
        }
    },
});
