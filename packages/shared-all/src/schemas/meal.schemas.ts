import { z } from "zod";
import type { APIResponsePayload } from "./common.schemas.js";
import { recipeSchema } from "./recipe.schemas.js";

export const mealSchema = z.object({
    id: z.uuid(),
    recipe: recipeSchema,
    order: z.number().int().nullable().optional(),
});

export type Meal = z.infer<typeof mealSchema>;

export const addMealSchema = z.object({
    recipeId: z.uuid(),
    order: z.number().int().optional(),
});
export type PlanAddRequest = z.infer<typeof addMealSchema>;
export type PlanAddResponse = APIResponsePayload<Meal>;

export type PlanGetResponse = APIResponsePayload<Meal[]>;

export const removeMealSchema = z.object({
    id: z.uuid(),
});
export type PlanRemoveRequest = z.infer<typeof removeMealSchema>;
// The API currently returns 204 No Content for remove; no response body
