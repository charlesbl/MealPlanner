import { z } from "zod";
import { APIResponse } from "./common.schemas.js";

// Shared types
export enum MealType {
    Breakfast = "Breakfast",
    Lunch = "Lunch",
    Dinner = "Dinner",
    Snacks = "Snacks",
}

export const mealSchema = z.object({
    id: z.uuid(),
    name: z
        .string()
        .min(1)
        .max(255)
        .transform((s) => s.trim()),
    description: z
        .string()
        .max(10_000)
        .transform((s) => s.trim())
        .optional(),
    mealTypes: z.array(z.enum(MealType)).min(1),
    createdAt: z.coerce.date(),
});

export type Meal = z.infer<typeof mealSchema>;

// Create
export const createMealSchema = z.object({
    name: mealSchema.shape.name,
    description: mealSchema.shape.description,
    mealTypes: mealSchema.shape.mealTypes,
});
export type MealCreateRequest = z.infer<typeof createMealSchema>;
export type MealCreateResponse = APIResponse<Meal>;

// Update (partial create)
export const updateMealSchema = createMealSchema.partial();
export type MealUpdateRequest = z.infer<typeof updateMealSchema>;
export type MealUpdateResponse = APIResponse<Meal>;

// Get/List
export type MealGetResponse = APIResponse<Meal>;
export type MealListResponse = APIResponse<Meal[]>;
