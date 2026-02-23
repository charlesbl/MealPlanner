import { z } from "zod";
import type { APIResponsePayload } from "./common.schemas.js";

export const userProfileSchema = z.object({
    userId: z.string(),
    height: z.number().nullable(),
    weight: z.number().nullable(),
    age: z.number().nullable(),
    calorieGoal: z.number().nullable(),
    proteinGoal: z.number().nullable(),
    carbsGoal: z.number().nullable(),
    fatGoal: z.number().nullable(),
    updatedAt: z.coerce.date(),
});
export type UserProfile = z.infer<typeof userProfileSchema>;

export const updateProfileRequestSchema = userProfileSchema
    .omit({ userId: true, updatedAt: true })
    .partial();
export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;
export type UpdateProfileResponse = APIResponsePayload<UserProfile>;
