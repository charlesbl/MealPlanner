import { z } from "zod";
import type { APIResponse } from "./common.schemas.js";
import { mealSchema } from "./meal.schemas.js";

export const planItemSchema = z.object({
    id: z.uuid(),
    meal: mealSchema,
    order: z.number().int().nullable().optional(),
});

export type PlanMeal = z.infer<typeof planItemSchema>;

export const addPlanItemSchema = z.object({
    mealId: z.uuid(),
    order: z.number().int().optional(),
});
export type PlanAddRequest = z.infer<typeof addPlanItemSchema>;
export type PlanAddResponse = APIResponse<PlanMeal>;

export type PlanListResponse = APIResponse<PlanMeal[]>;

export const removePlanItemSchema = z.object({
    id: z.uuid(),
});
export type PlanRemoveRequest = z.infer<typeof removePlanItemSchema>;
// The API currently returns 204 No Content for remove; no response body
