import { DynamicStructuredTool } from "@langchain/core/tools";
import { planService } from "@mealplanner/shared-all";
import { z } from "zod";
import { AgentTool } from "./types.js";

const removeMealSchema = z.object({
    id: z.string().describe("The ID of the planItem to remove from the plan"),
});

export const getRemoveRecipeFromPlanTool = (
    token: string
): AgentTool<typeof removeMealSchema> => {
    return {
        schema: removeMealSchema,
        getToolUpdateEventOnToolEnd: (input) => ({
            // TODO send an update with the recipe added to avoid reloading the plan
            type: "updatePlan",
        }),
        tool: new DynamicStructuredTool({
            name: "remove_recipe_from_plan",
            description:
                "Removes an item from the current plan. The item's recipe remains in your library and can be added back later.",
            schema: removeMealSchema,
            func: async (
                input: z.infer<typeof removeMealSchema>
            ): Promise<string> => {
                try {
                    await planService.removeFromPlan({ id: input.id }, token);
                    return `Removed plan item with ID '${input.id}' from the plan.`;
                } catch (error: any) {
                    console.error("Error in removeRecipeFromPlanTool:", error);
                    return `Error removing item from plan: ${error.message}`;
                }
            },
        }),
    };
};
