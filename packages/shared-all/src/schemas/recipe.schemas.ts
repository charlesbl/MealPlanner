import { z } from "zod";
import type { APIResponse } from "./common.schemas.js";

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
    createdAt: z.coerce.date(),
});

export type Recipe = z.infer<typeof recipeSchema>;

// Create
export const createRecipeSchema = z.object({
    name: recipeSchema.shape.name,
    description: recipeSchema.shape.description,
    recipeTypes: recipeSchema.shape.recipeTypes,
});
export type RecipeCreateRequest = z.infer<typeof createRecipeSchema>;
export type RecipeCreateResponse = APIResponse<Recipe>;

// Get
export const getRecipeSchema = z.object({
    id: z.uuid(),
});
export type RecipeGetRequest = z.infer<typeof getRecipeSchema>;
export type RecipeGetResponse = APIResponse<Recipe>;

// Update (use partial of createRecipeSchema and add id)
export const updateRecipeSchema = createRecipeSchema.extend({
    id: z.uuid(),
});
export type RecipeUpdateRequest = z.infer<typeof updateRecipeSchema>;
export type RecipeUpdateResponse = APIResponse<Recipe>;

// List
export type RecipeListResponse = APIResponse<Recipe[]>;

// Remove
export const removeRecipeSchema = z.object({
    id: z.uuid(),
});
