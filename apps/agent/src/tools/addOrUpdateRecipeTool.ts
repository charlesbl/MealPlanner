import { DynamicStructuredTool } from "@langchain/core/tools";
import { libraryService, RecipeType } from "@mealplanner/shared-all";
import { z } from "zod";
import { AgentTool } from "./types.js";

const addOrUpdateRecipeSchema = z.object({
    recipeName: z.string().describe("The name of the recipe to add or update"),
    description: z
        .string()
        .describe("Description, ingredients, or notes about the recipe"),
    recipeTypes: z
        .array(z.enum(RecipeType))
        .min(1, "At least one recipe type is required"),
    recipeId: z
        .string()
        .optional()
        .describe(
            "Optional recipe ID for updating an existing recipe (leave empty to add new recipe)",
        ),
});

export const getAddOrUpdateRecipeTool = (
    token: string,
): AgentTool<typeof addOrUpdateRecipeSchema> => {
    return {
        schema: addOrUpdateRecipeSchema,
        getToolUpdateEventOnToolEnd: (input) => {
            if (input.recipeId) {
                return {
                    type: "updateRecipe",
                    recipeId: input.recipeId,
                };
            } else {
                return {
                    type: "updateLibrary",
                };
            }
        },
        tool: new DynamicStructuredTool({
            name: "add_or_update_recipe",
            description: `Adds a new recipe or updates an existing recipe. Valid recipe types are: ${Object.values(
                RecipeType,
            ).join(
                ", ",
            )}. If recipeId is provided, the existing recipe will be updated; otherwise, a new recipe will be created.`,
            schema: addOrUpdateRecipeSchema,
            func: async (
                input: z.infer<typeof addOrUpdateRecipeSchema>,
            ): Promise<string> => {
                try {
                    if (input.recipeId) {
                        // Update existing recipe via API
                        const updated = await libraryService.updateRecipe(
                            input.recipeId,
                            {
                                name: input.recipeName,
                                description: input.description,
                                recipeTypes: input.recipeTypes,
                            },
                            token,
                        );
                        return `Successfully updated recipe '${updated.name}' (${updated.recipeTypes}).`;
                    } else {
                        // Add new recipe via API
                        const created = await libraryService.addRecipe(
                            {
                                name: input.recipeName,
                                description: input.description,
                                recipeTypes: input.recipeTypes,
                            },
                            token,
                        );
                        return `Successfully added new ${created.recipeTypes} recipe: '${created.name}'. Recipe ID: ${created.id}. You can now add this recipe to your plan or manage it in your library.`;
                    }
                } catch (error: any) {
                    console.error("Error in addOrUpdateRecipeTool:", error);
                    return `Error managing recipe: ${error.message}`;
                }
            },
        }),
    };
};
