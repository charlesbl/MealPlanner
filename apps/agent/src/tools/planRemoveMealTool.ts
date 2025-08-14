import { DynamicStructuredTool } from "@langchain/core/tools";
import { planService } from "@mealplanner/shared-all";
import { z } from "zod";
import { AgentTool } from "./types.js";

const removeMealFromPlanSchema = z.object({
    id: z.string().describe("The ID of the planItem to remove from the plan"),
});

export const getRemoveMealFromPlanTool = (
    token: string
): AgentTool<typeof removeMealFromPlanSchema> => {
    return {
        schema: removeMealFromPlanSchema,
        getToolUpdateEventOnToolEnd: (input) => ({
            // TODO send an update with the meal added to avoid reloading the plan
            type: "updatePlan",
        }),
        tool: new DynamicStructuredTool({
            name: "remove_meal_from_plan",
            description:
                "Removes a item from the current plan. The item's meal will remain in your library and can be added back later.",
            schema: removeMealFromPlanSchema,
            func: async (
                input: z.infer<typeof removeMealFromPlanSchema>
            ): Promise<string> => {
                try {
                    await planService.removeFromPlan({ id: input.id }, token);
                    return `Removed meal with ID '${input.id}' from the plan.`;
                } catch (error: any) {
                    console.error("Error in removeMealFromPlanTool:", error);
                    return `Error removing meal from plan: ${error.message}`;
                }
            },
        }),
    };
};
