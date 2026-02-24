import { DynamicStructuredTool } from "@langchain/core/tools";
import { libraryService } from "@mealplanner/shared-all";
import { z } from "zod";
import { estimateNutrition } from "../utils/estimateNutrition.js";
import { AgentTool } from "./types.js";

const enrichRecipeNutritionSchema = z.object({
    recipeId: z.string().describe("ID of the recipe to compute nutrition for"),
    recipeName: z.string().describe("Name of the recipe"),
    recipeDescription: z
        .string()
        .optional()
        .describe("Description of the recipe, if available"),
});

export const getEnrichRecipeNutritionTool = (
    token: string,
): AgentTool<typeof enrichRecipeNutritionSchema> => {
    return {
        schema: enrichRecipeNutritionSchema,
        getToolUpdateEventOnToolEnd: (input) => ({
            type: "updateRecipe",
            recipeId: input.recipeId,
        }),
        tool: new DynamicStructuredTool({
            name: "enrich_recipe_nutrition",
            description:
                "Computes and saves the nutritional information (calories, macros) for an existing recipe in the library. Use this tool when the user wants to know the macros of a recipe or when a recipe does not yet have nutritional values.",
            schema: enrichRecipeNutritionSchema,
            func: async (
                input: z.infer<typeof enrichRecipeNutritionSchema>,
            ): Promise<string> => {
                try {
                    const description = [
                        input.recipeName,
                        input.recipeDescription,
                    ]
                        .filter(Boolean)
                        .join("\n");
                    const nutrition = await estimateNutrition(description);
                    const recipe = await libraryService.enrichRecipeNutrition(
                        input.recipeId,
                        nutrition,
                        token,
                    );
                    if (!recipe.nutrition) {
                        return `Could not estimate nutrition for recipe '${recipe.name}'.`;
                    }
                    const { calories, protein, carbs, fat } = recipe.nutrition;
                    return `Nutrition computed for '${recipe.name}': ${calories} kcal, P: ${protein}g, C: ${carbs}g, F: ${fat}g`;
                } catch (error: any) {
                    console.error("Error in enrichRecipeNutritionTool:", error);
                    return `Error computing nutritional values: ${error.message}`;
                }
            },
        }),
    };
};
