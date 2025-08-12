import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { AgentTool } from "./types.js";

const readWeekSelectionSchema = z.object({
    showDetails: z
        .boolean()
        .optional()
        .describe(
            "Whether to include meal descriptions in the output (default: true)"
        ),
});

// TODO: Remplacer par appel API semaine quand disponible
export const getReadWeekSelectionTool = (
    token: string
): AgentTool<typeof readWeekSelectionSchema> => {
    return {
    schema: readWeekSelectionSchema,
        tool: new DynamicStructuredTool({
            name: "read_week_selection",
            description:
                "Reads the current weekly meal selection. Shows all meals selected for the week with optional grouping by meal type.",
            schema: readWeekSelectionSchema,
            func: async (
                input: z.infer<typeof readWeekSelectionSchema>
            ): Promise<string> => {
                try {
                    // TODO: Appel API pour lire la sélection semaine avec le token
                    return `Weekly selection read (API call to be implemented).`;
                } catch (error: any) {
                    console.error("Error in readWeekSelectionTool:", error);
                    return `Error reading weekly selection: ${error.message}`;
                }
            },
        }),
    };
};
