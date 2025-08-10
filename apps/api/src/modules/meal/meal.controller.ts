import { AuthRequest } from "@mealplanner/shared-back";
import { Response } from "express";
import { AppDataSource } from "../../data-source.js";
import { MealEntity } from "./meal.entity.js";
import { createMealSchema, updateMealSchema } from "./meal.schemas.js";

export function mealControllerFactory() {
    const mealsRepo = AppDataSource.getRepository(MealEntity);
    return {
        getAll: async (req: AuthRequest, res: Response) => {
            const userId = req.user?.sub;
            if (!userId) return res.status(401).json({ error: "Unauthorized" });
            const meals = await mealsRepo.find({
                where: { user: { id: userId } },
            });
            res.json(meals);
        },
        getById: async (req: AuthRequest, res: Response) => {
            const userId = req.user?.sub;
            if (!userId) return res.status(401).json({ error: "Unauthorized" });
            const meal = await mealsRepo.findOne({
                where: { id: req.params.id, user: { id: userId } },
            });
            if (!meal) return res.status(404).json({ error: "Meal not found" });
            res.json(meal);
        },
        create: async (req: AuthRequest, res: Response) => {
            const userId = req.user?.sub;
            if (!userId) return res.status(401).json({ error: "Unauthorized" });
            try {
                const data = createMealSchema.parse(req.body);
                const meal = mealsRepo.create({
                    ...data,
                    user: { id: userId },
                });
                await mealsRepo.save(meal);
                res.status(201).json(meal);
            } catch (err) {
                res.status(400).json({ error: "Invalid data", details: err });
            }
        },
        update: async (req: AuthRequest, res: Response) => {
            const userId = req.user?.sub;
            if (!userId) return res.status(401).json({ error: "Unauthorized" });
            try {
                const meal = await mealsRepo.findOne({
                    where: { id: req.params.id, user: { id: userId } },
                });
                if (!meal)
                    return res.status(404).json({ error: "Meal not found" });
                const updates = updateMealSchema.parse(req.body);
                Object.assign(meal, updates);
                await mealsRepo.save(meal);
                res.json(meal);
            } catch (err) {
                res.status(400).json({ error: "Invalid data", details: err });
            }
        },
        delete: async (req: AuthRequest, res: Response) => {
            const userId = req.user?.sub;
            if (!userId) return res.status(401).json({ error: "Unauthorized" });
            const meal = await mealsRepo.findOne({
                where: { id: req.params.id, user: { id: userId } },
            });
            if (!meal) return res.status(404).json({ error: "Meal not found" });
            await mealsRepo.remove(meal);
            res.status(204).send();
        },
    };
}
