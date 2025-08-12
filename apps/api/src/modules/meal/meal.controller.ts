import type {
    MealCreateResponse,
    MealGetResponse,
    MealListResponse,
    MealUpdateResponse,
} from "@mealplanner/shared-all";
import { createMealSchema, updateMealSchema } from "@mealplanner/shared-all";
import type { AuthRequest } from "@mealplanner/shared-back";
import { Response } from "express";
import { AppDataSource } from "../../data-source.js";
import { MealEntity } from "./meal.entity.js";

export function mealControllerFactory() {
    const mealsRepo = AppDataSource.getRepository(MealEntity);
    return {
        getAll: async (req: AuthRequest, res: Response<MealListResponse>) => {
            const userId = req.user?.sub;
            if (!userId)
                return res.status(401).json({
                    status: "error",
                    error: "Unauthorized",
                });
            const meals = await mealsRepo.find({
                where: { user: { id: userId } },
            });
            res.json({ status: "success", data: meals });
        },
        getById: async (req: AuthRequest, res: Response<MealGetResponse>) => {
            const userId = req.user?.sub;
            if (!userId)
                return res.status(401).json({
                    status: "error",
                    error: "Unauthorized",
                });
            const meal = await mealsRepo.findOne({
                where: { id: req.params.id, user: { id: userId } },
            });
            if (!meal)
                return res.status(404).json({
                    status: "error",
                    error: "Meal not found",
                });
            res.json({ status: "success", data: meal });
        },
        create: async (req: AuthRequest, res: Response<MealCreateResponse>) => {
            const userId = req.user?.sub;
            if (!userId)
                return res.status(401).json({
                    status: "error",
                    error: "Unauthorized",
                });
            try {
                const data = createMealSchema.parse(req.body);
                const meal = mealsRepo.create({
                    ...data,
                    user: { id: userId },
                });
                await mealsRepo.save(meal);
                res.status(201).json({ status: "success", data: meal });
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
        update: async (req: AuthRequest, res: Response<MealUpdateResponse>) => {
            const userId = req.user?.sub;
            if (!userId)
                return res.status(401).json({
                    status: "error",
                    error: "Unauthorized",
                });
            try {
                const meal = await mealsRepo.findOne({
                    where: { id: req.params.id, user: { id: userId } },
                });
                if (!meal)
                    return res.status(404).json({
                        status: "error",
                        error: "Meal not found",
                    });
                const updates = updateMealSchema.parse(req.body);
                Object.assign(meal, updates);
                await mealsRepo.save(meal);
                res.json({ status: "success", data: meal });
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
        delete: async (req: AuthRequest, res: Response) => {
            const userId = req.user?.sub;
            if (!userId)
                return res.status(401).json({
                    status: "error",
                    error: "Unauthorized",
                });
            const meal = await mealsRepo.findOne({
                where: { id: req.params.id, user: { id: userId } },
            });
            if (!meal)
                return res.status(404).json({
                    status: "error",
                    error: "Meal not found",
                });
            await mealsRepo.remove(meal);
            res.status(204).send();
        },
    };
}
