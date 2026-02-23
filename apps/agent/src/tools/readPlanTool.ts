import { DynamicStructuredTool } from "@langchain/core/tools";
import { planService } from "@mealplanner/shared-all";
import { z } from "zod";
import { AgentTool } from "./types.js";

const readPlanSchema = z.object({
    showDetails: z
        .boolean()
        .optional()
        .describe(
            "Whether to include recipe descriptions in the output (default: true)",
        ),
});

export const getReadPlanTool = (
    token: string,
): AgentTool<typeof readPlanSchema> => {
    return {
        schema: readPlanSchema,
        tool: new DynamicStructuredTool({
            name: "read_plan",
            description:
                "Reads the current plan. Shows all items in plan, containing the recipe for each item.",
            schema: readPlanSchema,
            func: async (
                input: z.infer<typeof readPlanSchema>,
            ): Promise<string> => {
                try {
                    const items = await planService.fetchPlan(token);
                    if (items.length === 0) return "Your plan is empty.";
                    const plan = items.map((item) => ({
                        id: item.id,
                        recipe: {
                            id: item.recipe.id,
                            name: item.recipe.name,
                            description: input.showDetails
                                ? item.recipe.description || "No description"
                                : undefined,
                            recipeType: item.recipe.recipeTypes.join(", "),
                        },
                        order: item.order,
                    }));
                    return JSON.stringify(plan);
                } catch (error: any) {
                    console.error("Error in readPlanTool:", error);
                    return `Error reading plan: ${error.message}`;
                }
            },
        }),
    };
};
