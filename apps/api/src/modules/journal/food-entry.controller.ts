import type {
    CreateFoodEntryRequest,
    FoodEntry,
    NutritionInfo,
} from "@mealplanner/shared-all";
import { createFoodEntryRequestSchema } from "@mealplanner/shared-all";
import type { APIResponsePayload } from "@mealplanner/shared-all";
import type { AuthAPIResponse } from "@mealplanner/shared-back";
import { Request } from "express";
import { AppDataSource } from "../../data-source.js";
import { FoodEntryEntity } from "./food-entry.entity.js";

async function estimateNutrition(description: string): Promise<NutritionInfo> {
    try {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

        const res = await fetch(
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
                            content: `Tu es un nutritionniste expert. Estime les macronutriments pour : ${description}. Réponds UNIQUEMENT en JSON valide, sans texte autour : { "calories": number, "protein": number, "carbs": number, "fat": number }. Toutes les valeurs en nombres entiers.`,
                        },
                    ],
                }),
            },
        );

        if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`);
        const data = await res.json();
        const content: string = data.choices?.[0]?.message?.content ?? "";
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found in response");
        const parsed = JSON.parse(jsonMatch[0]);
        return {
            calories: Number(parsed.calories) || 0,
            protein: Number(parsed.protein) || 0,
            carbs: Number(parsed.carbs) || 0,
            fat: Number(parsed.fat) || 0,
        };
    } catch (err) {
        console.error("[journal] estimateNutrition error:", err);
        return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
}

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
        createdAt: entity.createdAt,
    };
}

function sumNutrition(entries: FoodEntryEntity[]): NutritionInfo {
    return entries.reduce(
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
                return res
                    .status(400)
                    .json({
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
                return res
                    .status(400)
                    .json({
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
            const nutrition = await estimateNutrition(body.description);

            const entry = repo.create({
                user: { id: userId },
                description: body.description,
                date: body.date,
                mealType: body.mealType,
                calories: nutrition.calories,
                protein: nutrition.protein,
                carbs: nutrition.carbs,
                fat: nutrition.fat,
            });
            await repo.save(entry);
            res.status(201).json({
                status: "success",
                data: toFoodEntry(entry, userId),
            });
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
