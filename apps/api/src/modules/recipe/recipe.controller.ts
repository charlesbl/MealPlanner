import type {
    NutritionInfo,
    RecipeCreateBodyResponse,
    RecipeGetBodyResponse,
    RecipeListBodyResponse,
    RecipeUpdateBodyResponse,
} from "@mealplanner/shared-all";
import {
    createRecipeSchema,
    getRecipeSchema,
    removeRecipeSchema,
    updateRecipeSchema,
} from "@mealplanner/shared-all";
import { AuthAPIResponse } from "@mealplanner/shared-back";
import { Request } from "express";
import { AppDataSource } from "../../data-source.js";
import { RecipeEntity } from "./recipe.entity.js";

export function recipeControllerFactory() {
    const recipeRepo = AppDataSource.getRepository(RecipeEntity);
    return {
        getLibrary: async (
            req: Request,
            res: AuthAPIResponse<RecipeListBodyResponse>,
        ) => {
            const userId = res.locals.user.sub;
            const recipes = await recipeRepo.find({
                where: { user: { id: userId } },
            });
            res.json({ status: "success", data: recipes });
        },
        getById: async (
            req: Request,
            res: AuthAPIResponse<RecipeGetBodyResponse>,
        ) => {
            const userId = res.locals.user.sub;
            const { id } = getRecipeSchema.parse(req.params);
            const recipe = await recipeRepo.findOne({
                where: { id, user: { id: userId } },
            });
            if (!recipe)
                return res.status(404).json({
                    status: "error",
                    error: "Recipe not found",
                });
            res.json({ status: "success", data: recipe });
        },
        create: async (
            req: Request,
            res: AuthAPIResponse<RecipeCreateBodyResponse>,
        ) => {
            const userId = res.locals.user.sub;
            try {
                const data = createRecipeSchema.parse(req.body);
                const recipe = recipeRepo.create({
                    ...data,
                    user: { id: userId },
                });
                await recipeRepo.save(recipe);
                res.status(201).json({ status: "success", data: recipe });
            } catch (err) {
                res.status(400).json({
                    status: "error",
                    error: (err && typeof err === "object" && "message" in err
                        ? (err as any).message
                        : typeof err === "string"
                          ? err
                          : "Invalid data") as string,
                });
            }
        },
        update: async (
            req: Request,
            res: AuthAPIResponse<RecipeUpdateBodyResponse>,
        ) => {
            const userId = res.locals.user.sub;
            try {
                const { id } = updateRecipeSchema.parse(req.params);
                const recipe = await recipeRepo.findOne({
                    where: { id, user: { id: userId } },
                });
                if (!recipe)
                    return res.status(404).json({
                        status: "error",
                        error: "Recipe not found",
                    });
                const updates = updateRecipeSchema.parse(req.body);
                Object.assign(recipe, updates);
                await recipeRepo.save(recipe);
                res.json({ status: "success", data: recipe });
            } catch (err) {
                res.status(400).json({
                    status: "error",
                    error: (err && typeof err === "object" && "message" in err
                        ? (err as any).message
                        : typeof err === "string"
                          ? err
                          : "Invalid data") as string,
                });
            }
        },
        enrichNutrition: async (
            req: Request,
            res: AuthAPIResponse<RecipeGetBodyResponse>,
        ) => {
            const userId = res.locals.user.sub;
            const { id } = getRecipeSchema.parse(req.params);
            const recipe = await recipeRepo.findOne({
                where: { id, user: { id: userId } },
            });
            if (!recipe)
                return res.status(404).json({
                    status: "error",
                    error: "Recipe not found",
                });

            try {
                const apiKey = process.env.OPENROUTER_API_KEY;
                if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

                const description = [recipe.name, recipe.description]
                    .filter(Boolean)
                    .join("\n");
                const llmRes = await fetch(
                    "https://openrouter.ai/api/v1/chat/completions",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${apiKey}`,
                        },
                        body: JSON.stringify({
                            model: "z-ai/glm-4.7",
                            messages: [
                                {
                                    role: "user",
                                    content: `Tu es un nutritionniste expert. Estime les macronutriments pour une portion de : ${description}. Réponds UNIQUEMENT en JSON valide, sans texte autour : { "calories": number, "protein": number, "carbs": number, "fat": number }. Toutes les valeurs en nombres entiers.`,
                                },
                            ],
                        }),
                    },
                );

                if (!llmRes.ok)
                    throw new Error(`OpenRouter error: ${llmRes.status}`);
                const data = await llmRes.json();
                const content: string =
                    data.choices?.[0]?.message?.content ?? "";
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (!jsonMatch)
                    throw new Error("No JSON found in LLM response");
                const parsed = JSON.parse(jsonMatch[0]);
                const nutrition: NutritionInfo = {
                    calories: Number(parsed.calories) || 0,
                    protein: Number(parsed.protein) || 0,
                    carbs: Number(parsed.carbs) || 0,
                    fat: Number(parsed.fat) || 0,
                };
                recipe.nutrition = nutrition;
                await recipeRepo.save(recipe);
            } catch (err) {
                console.error("[recipe] enrichNutrition LLM error:", err);
                recipe.nutrition = {
                    calories: 0,
                    protein: 0,
                    carbs: 0,
                    fat: 0,
                };
                await recipeRepo.save(recipe);
            }

            res.json({ status: "success", data: recipe });
        },
        remove: async (req: Request, res: AuthAPIResponse<never>) => {
            const userId = res.locals.user.sub;
            const { id } = removeRecipeSchema.parse(req.params);
            const recipe = await recipeRepo.findOne({
                where: { id, user: { id: userId } },
            });
            if (!recipe)
                return res.status(404).json({
                    status: "error",
                    error: "Recipe not found",
                });
            await recipeRepo.remove(recipe);
            res.status(204).send();
        },
    };
}
