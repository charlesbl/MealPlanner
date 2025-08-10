import { MealType } from "@mealplanner/shared";
import { z } from "zod";

export const mealSchema = z.object({
    id: z.uuid(),
    name: z.string().min(1),
    description: z.string().optional(),
    mealTypes: z.array(z.enum(MealType)).min(1),
    createdAt: z.coerce.date(),
});

export const createMealSchema = mealSchema.omit({ id: true, createdAt: true });
export const updateMealSchema = mealSchema
    .partial()
    .omit({ id: true, createdAt: true });
