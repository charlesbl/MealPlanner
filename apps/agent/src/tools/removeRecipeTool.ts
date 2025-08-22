import { DynamicStructuredTool } from "@langchain/core/tools";
import { libraryService } from "@mealplanner/shared-all";
import { z } from "zod";
import { AgentTool } from "./types.js";

const deleteRecipeSchema = z.object({
    recipeId: z.string().describe("The ID of the recipe to delete"),
});

export const getDeleteRecipeTool = (
    token: string
): AgentTool<typeof deleteRecipeSchema> => {
    return {
        schema: deleteRecipeSchema,
        getToolUpdateEventOnToolEnd: (input) => ({
            type: "removeRecipe",
            recipeId: input.recipeId,
        }),
        tool: new DynamicStructuredTool({
            name: "delete_recipe",
            description: "Deletes a recipe by its ID.",
            schema: deleteRecipeSchema,
            func: async (input): Promise<string> => {
                try {
                    await libraryService.deleteRecipe(input.recipeId, token);
                    return `Successfully deleted recipe with ID: '${input.recipeId}'.`;
                } catch (error: any) {
                    console.error("Error in deleteRecipeTool:", error);
                    return `Error deleting recipe: ${error.message}`;
                }
            },
        }),
    };
};
