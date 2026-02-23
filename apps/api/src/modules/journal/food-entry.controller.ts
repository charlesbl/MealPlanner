import type {
    CreateFoodEntryRequest,
    FoodEntry,
    NutritionInfo,
    UpdateFoodEntryRequest,
} from "@mealplanner/shared-all";
import {
    createFoodEntryRequestSchema,
    updateFoodEntryRequestSchema,
} from "@mealplanner/shared-all";
import type { APIResponsePayload } from "@mealplanner/shared-all";
import type { AuthAPIResponse } from "@mealplanner/shared-back";
import { Request } from "express";
import { AppDataSource } from "../../data-source.js";
import { FoodEntryEntity } from "./food-entry.entity.js";

const EMPTY_NUTRITION: NutritionInfo = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
};

function toFoodEntry(entity: FoodEntryEntity, userId: string): FoodEntry {
    return {
        id: entity.id,
        userId,
        description: entity.description,
        date: entity.date,
        mealType: entity.mealType,
        nutrition: {
            calories: entity.calories,
            protein: entity.protein,
            carbs: entity.carbs,
            fat: entity.fat,
        },
        status: entity.status,
        errorMessage: entity.errorMessage,
        createdAt: entity.createdAt,
    };
}

function sumNutrition(entries: FoodEntryEntity[]): NutritionInfo {
    return entries
        .filter((e) => e.status === "completed")
        .reduce(
            (acc, e) => ({
                calories: acc.calories + e.calories,
                protein: acc.protein + e.protein,
                carbs: acc.carbs + e.carbs,
                fat: acc.fat + e.fat,
            }),
            { calories: 0, protein: 0, carbs: 0, fat: 0 },
        );
}

type DayEntriesResponse = APIResponsePayload<{
    entries: FoodEntry[];
    totals: NutritionInfo;
}>;

type WeekResponse = APIResponsePayload<{
    days: { date: string; totals: NutritionInfo }[];
}>;

type CreateResponse = APIResponsePayload<FoodEntry>;
type UpdateResponse = APIResponsePayload<FoodEntry>;

export function journalControllerFactory() {
    const repo = AppDataSource.getRepository(FoodEntryEntity);

    return {
        getByDate: async (
            req: Request,
            res: AuthAPIResponse<DayEntriesResponse>,
        ) => {
            const userId = res.locals.user.sub;
            const date = req.query.date as string;
            if (!date) {
                return res.status(400).json({
                    status: "error",
                    error: "date query param required",
                });
            }
            const entries = await repo.find({
                where: { user: { id: userId }, date },
                order: { createdAt: "ASC" },
            });
            res.json({
                status: "success",
                data: {
                    entries: entries.map((e) => toFoodEntry(e, userId)),
                    totals: sumNutrition(entries),
                },
            });
        },

        getWeek: async (req: Request, res: AuthAPIResponse<WeekResponse>) => {
            const userId = res.locals.user.sub;
            const startDate = req.query.startDate as string;
            if (!startDate) {
                return res.status(400).json({
                    status: "error",
                    error: "startDate query param required",
                });
            }

            const start = new Date(startDate);
            const days: { date: string; totals: NutritionInfo }[] = [];

            for (let i = 0; i < 7; i++) {
                const d = new Date(start);
                d.setDate(d.getDate() + i);
                const dateStr = d.toISOString().slice(0, 10);
                const entries = await repo.find({
                    where: { user: { id: userId }, date: dateStr },
                });
                days.push({ date: dateStr, totals: sumNutrition(entries) });
            }

            res.json({ status: "success", data: { days } });
        },

        create: async (req: Request, res: AuthAPIResponse<CreateResponse>) => {
            const userId = res.locals.user.sub;
            const body: CreateFoodEntryRequest =
                createFoodEntryRequestSchema.parse(req.body);
            const nutrition = body.nutrition ?? EMPTY_NUTRITION;

            const entry = repo.create({
                user: { id: userId },
                description: body.description,
                date: body.date,
                mealType: body.mealType,
                calories: nutrition.calories,
                protein: nutrition.protein,
                carbs: nutrition.carbs,
                fat: nutrition.fat,
                status: body.status ?? "completed",
            });
            await repo.save(entry);
            res.status(201).json({
                status: "success",
                data: toFoodEntry(entry, userId),
            });
        },

        update: async (req: Request, res: AuthAPIResponse<UpdateResponse>) => {
            const userId = res.locals.user.sub;
            const { id } = req.params;
            const body: UpdateFoodEntryRequest =
                updateFoodEntryRequestSchema.parse(req.body);
            const entry = await repo.findOne({
                where: { id, user: { id: userId } },
            });
            if (!entry) {
                return res
                    .status(404)
                    .json({ status: "error", error: "Food entry not found" });
            }
            entry.status = body.status;
            if (body.nutrition) {
                entry.calories = body.nutrition.calories;
                entry.protein = body.nutrition.protein;
                entry.carbs = body.nutrition.carbs;
                entry.fat = body.nutrition.fat;
            }
            if (body.errorMessage !== undefined) {
                entry.errorMessage = body.errorMessage;
            }
            await repo.save(entry);
            res.json({ status: "success", data: toFoodEntry(entry, userId) });
        },

        remove: async (req: Request, res: AuthAPIResponse<never>) => {
            const userId = res.locals.user.sub;
            const { id } = req.params;
            const entry = await repo.findOne({
                where: { id, user: { id: userId } },
            });
            if (!entry) {
                return res
                    .status(404)
                    .json({ status: "error", error: "Food entry not found" });
            }
            await repo.remove(entry);
            res.status(204).send();
        },
    };
}
