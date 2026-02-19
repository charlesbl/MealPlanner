import { z } from "zod";
import type { APIResponsePayload } from "./common.schemas.js";
import { nutritionInfoSchema } from "./nutrition.schemas.js";

export const MealTypeSchema = z.enum(["breakfast", "lunch", "dinner", "snack"]);
export type MealType = z.infer<typeof MealTypeSchema>;

export const foodEntrySchema = z.object({
    id: z.uuid(),
    userId: z.string(),
    description: z.string(),
    date: z.string(), // YYYY-MM-DD
    mealType: MealTypeSchema,
    nutrition: nutritionInfoSchema,
    createdAt: z.coerce.date(),
});
export type FoodEntry = z.infer<typeof foodEntrySchema>;

// Create
export const createFoodEntryRequestSchema = z.object({
    description: z.string().min(1),
    date: z.string(),
    mealType: MealTypeSchema,
});
export type CreateFoodEntryRequest = z.infer<
    typeof createFoodEntryRequestSchema
>;
export type CreateFoodEntryResponse = APIResponsePayload<FoodEntry>;

// Query
export const getFoodEntriesQuerySchema = z.object({
    date: z.string(),
});
export type GetFoodEntriesQuery = z.infer<typeof getFoodEntriesQuerySchema>;
