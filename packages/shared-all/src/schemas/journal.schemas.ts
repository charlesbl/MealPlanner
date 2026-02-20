import { z } from "zod";
import type { APIResponsePayload } from "./common.schemas.js";
import { nutritionInfoSchema } from "./nutrition.schemas.js";

export const MealTypeSchema = z.enum(["breakfast", "lunch", "dinner", "snack"]);
export type MealType = z.infer<typeof MealTypeSchema>;

export const FoodEntryStatusSchema = z.enum(["pending", "completed", "error"]);
export type FoodEntryStatus = z.infer<typeof FoodEntryStatusSchema>;

export const foodEntrySchema = z.object({
    id: z.uuid(),
    userId: z.string(),
    description: z.string(),
    date: z.string(), // YYYY-MM-DD
    mealType: MealTypeSchema,
    nutrition: nutritionInfoSchema,
    status: FoodEntryStatusSchema,
    errorMessage: z.string().nullable().optional(),
    createdAt: z.coerce.date(),
});
export type FoodEntry = z.infer<typeof foodEntrySchema>;

// Create
export const createFoodEntryRequestSchema = z.object({
    description: z.string().min(1),
    date: z.string(),
    mealType: MealTypeSchema,
    nutrition: nutritionInfoSchema.optional(),
    status: FoodEntryStatusSchema.optional(),
});
export type CreateFoodEntryRequest = z.infer<
    typeof createFoodEntryRequestSchema
>;
export type CreateFoodEntryResponse = APIResponsePayload<FoodEntry>;

// Update
export const updateFoodEntryRequestSchema = z.object({
    status: FoodEntryStatusSchema,
    nutrition: nutritionInfoSchema.optional(),
    errorMessage: z.string().nullable().optional(),
});
export type UpdateFoodEntryRequest = z.infer<
    typeof updateFoodEntryRequestSchema
>;

// Query
export const getFoodEntriesQuerySchema = z.object({
    date: z.string(),
});
export type GetFoodEntriesQuery = z.infer<typeof getFoodEntriesQuerySchema>;
