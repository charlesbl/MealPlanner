import type {
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
