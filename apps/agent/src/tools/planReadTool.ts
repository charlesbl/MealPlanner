import { DynamicStructuredTool } from "@langchain/core/tools";
import { planService } from "@mealplanner/shared-all";
import { z } from "zod";
import { AgentTool } from "./types.js";

const readPlanSelectionSchema = z.object({
    showDetails: z
        .boolean()
        .optional()
        .describe(
            "Whether to include meal descriptions in the output (default: true)"
        ),
});

export const getReadPlanSelectionTool = (
    token: string
): AgentTool<typeof readPlanSelectionSchema> => {
    return {
        schema: readPlanSelectionSchema,
        tool: new DynamicStructuredTool({
            name: "read_plan_selection",
            description:
                "Reads the current plan. Shows all items in plan, containing the meal for each item.",
            schema: readPlanSelectionSchema,
            func: async (
                input: z.infer<typeof readPlanSelectionSchema>
            ): Promise<string> => {
                try {
                    const items = await planService.fetchPlan(token);
                    if (items.length === 0) return "Your plan is empty.";
                    const plan = items.map((item) => ({
                        id: item.id,
                        meal: {
                            id: item.meal.id,
                            name: item.meal.name,
                            description: input.showDetails
                                ? item.meal.description || "No description"
                                : undefined,
                            mealType: item.meal.mealTypes.join(", "),
                        },
                        order: item.order,
                    }));
                    return JSON.stringify(plan);
                } catch (error: any) {
                    console.error("Error in readPlanSelectionTool:", error);
                    return `Error reading plan: ${error.message}`;
                }
            },
        }),
    };
};
