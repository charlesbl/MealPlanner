import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { weekStore } from "../state.js";

// Schema for reading week selection
const readWeekSelectionSchema = z.object({
    showDetails: z
        .boolean()
        .optional()
        .describe(
            "Whether to include meal descriptions in the output (default: true)"
        ),
});

export const ReadWeekSelectionTool = new DynamicStructuredTool({
    name: "read_week_selection",
    description:
        "Reads the current weekly meal selection. Shows all meals selected for the week with optional grouping by meal type.",
    schema: readWeekSelectionSchema,
    func: async (
        input: z.infer<typeof readWeekSelectionSchema>
    ): Promise<string> => {
        try {
            const selectedMeals = weekStore.getSelectedMealsWithData();

            if (selectedMeals.length === 0) {
                return "Your weekly selection is empty. You can add meals from your deck using the add_meal_to_week tool or generate an automatic selection using generate_week_selection.";
            }

            const showDetails = input.showDetails !== false; // Default to true

            let output = `Your weekly selection contains ${
                selectedMeals.length
            } meal${selectedMeals.length > 1 ? "s" : ""}:\n\n`;

            selectedMeals.forEach((meal, index) => {
                output += `${index + 1}. **${meal.name}** (${meal.mealTypes})`;
                if (showDetails && meal.description) {
                    const truncatedDesc =
                        meal.description.length > 100
                            ? meal.description.substring(0, 100) + "..."
                            : meal.description;
                    output += `\n   ${truncatedDesc}`;
                }
                output += `\n\n`;
            });

            return output;
        } catch (error: any) {
            console.error("Error in readWeekSelectionTool:", error);
            return `Error reading weekly selection: ${error.message}`;
        }
    },
});
