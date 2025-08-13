import { DynamicStructuredTool } from "@langchain/core/tools";
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

// TODO: Remplacer par appel API semaine quand disponible
export const getReadPlanSelectionTool = (
    token: string
): AgentTool<typeof readPlanSelectionSchema> => {
    return {
        schema: readPlanSelectionSchema,
        tool: new DynamicStructuredTool({
            name: "read_plan_selection",
            description:
                "Reads the current plan. Shows all meals selected for the plan with optional grouping by meal type.",
            schema: readPlanSelectionSchema,
            func: async (
                input: z.infer<typeof readPlanSelectionSchema>
            ): Promise<string> => {
                try {
                    // TODO: Appel API pour lire la sélection semaine avec le token
                    return `Plan read (API call to be implemented).`;
                } catch (error: any) {
                    console.error("Error in readPlanSelectionTool:", error);
                    return `Error reading plan: ${error.message}`;
                }
            },
        }),
    };
};
