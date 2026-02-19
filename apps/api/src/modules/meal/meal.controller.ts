import {
    addMealSchema,
    PlanAddBodyResponse,
    PlanGetBodyResponse,
    removeMealSchema,
} from "@mealplanner/shared-all";
import { AuthAPIResponse } from "@mealplanner/shared-back";
import { Request } from "express";
import { AppDataSource } from "../../data-source.js";
import RecipeEntity from "../recipe/recipe.entity.js";
import { MealEntity } from "./meal.entity.js";

export function mealControllerFactory() {
    const selectionRepo = AppDataSource.getRepository(MealEntity);
    const recipeRepo = AppDataSource.getRepository(RecipeEntity);
    return {
        get: async (
            req: Request,
            res: AuthAPIResponse<PlanGetBodyResponse>,
        ) => {
            const userId = res.locals.user.sub;
            const selections = await selectionRepo.find({
                where: { user: { id: userId } },
                relations: ["recipe"],
                order: { order: "ASC" },
            });
            res.json({ status: "success", data: selections });
        },
        add: async (
            req: Request,
            res: AuthAPIResponse<PlanAddBodyResponse>,
        ) => {
            const userId = res.locals.user.sub;
            const { recipeId, order } = addMealSchema.parse(req.body);
            const recipe = await recipeRepo.findOne({
                where: { id: recipeId, user: { id: userId } },
            });
            const isRecipeInLibrary = recipe !== null;
            if (!isRecipeInLibrary)
                return res.status(404).json({
                    status: "error",
                    error: "Recipe not in your library",
                });

            const selection = selectionRepo.create({
                user: { id: userId },
                recipe,
                order,
            });
            await selectionRepo.save(selection);
            res.status(201).json({ status: "success", data: selection });
        },
        remove: async (req: Request, res: AuthAPIResponse) => {
            const userId = res.locals.user.sub;
            const { id } = removeMealSchema.parse(req.body);
            const selection = await selectionRepo.findOne({
                where: { id, user: { id: userId } },
            });
            if (!selection)
                return res
                    .status(404)
                    .json({ status: "error", error: "Not in selection" });
            await selectionRepo.remove(selection);
            res.status(204).send();
        },
    };
}
