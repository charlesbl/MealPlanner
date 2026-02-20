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
                "Calcule et sauvegarde les informations nutritionnelles (calories, macros) d'une recette existante dans la bibliothèque. Utilise ce tool quand l'utilisateur veut connaître les macros d'une recette ou quand une recette n'a pas encore de valeurs nutritionnelles.",
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
                        return `Impossible d'estimer la nutrition pour la recette '${recipe.name}'.`;
                    }
                    const { calories, protein, carbs, fat } = recipe.nutrition;
                    return `Nutrition calculée pour '${recipe.name}' : ${calories} kcal, P: ${protein}g, G: ${carbs}g, L: ${fat}g`;
                } catch (error: any) {
                    console.error("Error in enrichRecipeNutritionTool:", error);
                    return `Erreur lors du calcul nutritionnel : ${error.message}`;
                }
            },
        }),
    };
};
