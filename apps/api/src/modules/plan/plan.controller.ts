import { AuthRequest } from "@mealplanner/shared-back";
import { Response } from "express";
import { AppDataSource } from "../../data-source.js";
import MealEntity from "../meal/meal.entity.js";
import { PlanEntity } from "./plan.entity.js";

export function planControllerFactory() {
    const selectionRepo = AppDataSource.getRepository(PlanEntity);
    const mealRepo = AppDataSource.getRepository(MealEntity);
    return {
        getAll: async (req: AuthRequest, res: Response) => {
            const userId = req.user?.sub;
            if (!userId)
                return res
                    .status(401)
                    .json({ status: "error", error: "Unauthorized" });
            const selections = await selectionRepo.find({
                where: { user: { id: userId } },
                relations: ["meal"],
                order: { order: "ASC" },
            });
            res.json({ status: "success", data: selections });
        },
        add: async (req: AuthRequest, res: Response) => {
            const userId = req.user?.sub;
            const { mealId, order } = req.body;
            if (!userId || !mealId)
                return res
                    .status(400)
                    .json({ status: "error", error: "Missing data" });

            const meal = await mealRepo.findOne({
                where: { id: mealId, user: { id: userId } },
            });
            const isMealInLibrary = meal !== null;
            if (!isMealInLibrary)
                return res.status(404).json({
                    status: "error",
                    error: "Meal not in your library",
                });

            const selection = selectionRepo.create({
                user: { id: userId },
                meal,
                order,
            });
            await selectionRepo.save(selection);
            res.status(201).json({ status: "success", data: selection });
        },
        remove: async (req: AuthRequest, res: Response) => {
            const userId = req.user?.sub;
            const { mealId } = req.body;
            if (!userId || !mealId)
                return res
                    .status(400)
                    .json({ status: "error", error: "Missing data" });
            const selection = await selectionRepo.findOne({
                where: { user: { id: userId }, meal: { id: mealId } },
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
