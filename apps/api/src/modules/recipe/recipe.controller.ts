import type {
    RecipeCreateResponse,
    RecipeGetResponse,
    RecipeListResponse,
    RecipeUpdateResponse,
} from "@mealplanner/shared-all";
import {
    createRecipeSchema,
    getRecipeSchema,
    removeRecipeSchema,
    updateRecipeSchema,
} from "@mealplanner/shared-all";
import type { AuthRequest } from "@mealplanner/shared-back";
import { Response } from "express";
import { AppDataSource } from "../../data-source.js";
import { RecipeEntity } from "./recipe.entity.js";

export function recipeControllerFactory() {
    const recipeRepo = AppDataSource.getRepository(RecipeEntity);
    return {
        getLibrary: async (
            req: AuthRequest,
            res: Response<RecipeListResponse>
        ) => {
            const userId = req.user?.sub;
            if (!userId)
                return res.status(401).json({
                    status: "error",
                    error: "Unauthorized",
                });
            const recipes = await recipeRepo.find({
                where: { user: { id: userId } },
            });
            res.json({ status: "success", data: recipes });
        },
        getById: async (req: AuthRequest, res: Response<RecipeGetResponse>) => {
            const userId = req.user?.sub;
            if (!userId)
                return res.status(401).json({
                    status: "error",
                    error: "Unauthorized",
                });
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
            req: AuthRequest,
            res: Response<RecipeCreateResponse>
        ) => {
            const userId = req.user?.sub;
            if (!userId)
                return res.status(401).json({
                    status: "error",
                    error: "Unauthorized",
                });
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
            req: AuthRequest,
            res: Response<RecipeUpdateResponse>
        ) => {
            const userId = req.user?.sub;
            if (!userId)
                return res.status(401).json({
                    status: "error",
                    error: "Unauthorized",
                });
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
        remove: async (req: AuthRequest, res: Response) => {
            const userId = req.user?.sub;
            if (!userId)
                return res.status(401).json({
                    status: "error",
                    error: "Unauthorized",
                });
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
