import { z } from "zod";

export const nutritionInfoSchema = z.object({
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
});

export type NutritionInfo = z.infer<typeof nutritionInfoSchema>;
