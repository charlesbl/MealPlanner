import { z } from "zod";
import type { APIResponse } from "./common.schemas.js";
import { recipeSchema } from "./recipe.schemas.js";

export const planItemSchema = z.object({
    id: z.uuid(),
    recipe: recipeSchema,
    order: z.number().int().nullable().optional(),
});

export type PlanItem = z.infer<typeof planItemSchema>;

export const addPlanItemSchema = z.object({
    recipeId: z.uuid(),
    order: z.number().int().optional(),
});
export type PlanAddRequest = z.infer<typeof addPlanItemSchema>;
export type PlanAddResponse = APIResponse<PlanItem>;

export type PlanGetResponse = APIResponse<PlanItem[]>;

export const removePlanItemSchema = z.object({
    id: z.uuid(),
});
export type PlanRemoveRequest = z.infer<typeof removePlanItemSchema>;
// The API currently returns 204 No Content for remove; no response body
