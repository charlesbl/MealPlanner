import { z } from "zod";
import type { APIResponsePayload } from "./common.schemas.js";
import { nutritionInfoSchema } from "./nutrition.schemas.js";

// Shared types
export enum RecipeType {
    Breakfast = "Breakfast",
    Lunch = "Lunch",
    Dinner = "Dinner",
    Snacks = "Snacks",
}

export const recipeSchema = z.object({
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
    recipeTypes: z.array(z.enum(RecipeType)).min(1),
    nutrition: nutritionInfoSchema.optional(),
    createdAt: z.coerce.date(),
});

export type Recipe = z.infer<typeof recipeSchema>;

// Create
export const createRecipeSchema = z.object({
    name: recipeSchema.shape.name,
    description: recipeSchema.shape.description,
    recipeTypes: recipeSchema.shape.recipeTypes,
});
export type RecipeCreateBodyRequest = z.infer<typeof createRecipeSchema>;
export type RecipeCreateBodyResponse = APIResponsePayload<Recipe>;

// Get
export const getRecipeSchema = z.object({
    id: z.uuid(),
});
export type RecipeGetBodyRequest = z.infer<typeof getRecipeSchema>;
export type RecipeGetBodyResponse = APIResponsePayload<Recipe>;

// Update (use partial of createRecipeSchema and add id)
export const updateRecipeSchema = createRecipeSchema.extend({
    id: z.uuid(),
});
export type RecipeUpdateBodyRequest = z.infer<typeof updateRecipeSchema>;
export type RecipeUpdateBodyResponse = APIResponsePayload<Recipe>;

// List
export type RecipeListBodyResponse = APIResponsePayload<Recipe[]>;

// Remove
export const removeRecipeSchema = z.object({
    id: z.uuid(),
});

// Enrich nutrition
export const enrichRecipeNutritionRequestSchema = z.object({
    nutrition: nutritionInfoSchema,
});
export type EnrichRecipeNutritionRequest = z.infer<
    typeof enrichRecipeNutritionRequestSchema
>;
export type EnrichRecipeBodyResponse = APIResponsePayload<Recipe>;
