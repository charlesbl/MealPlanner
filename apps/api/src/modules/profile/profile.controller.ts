import {
    type UpdateProfileRequest,
    type UserProfile,
    updateProfileRequestSchema,
} from "@mealplanner/shared-all";
import type { APIResponsePayload } from "@mealplanner/shared-all";
import type { AuthAPIResponse } from "@mealplanner/shared-back";
import { Request } from "express";
import { AppDataSource } from "../../data-source.js";
import { UserProfileEntity } from "./profile.entity.js";

function computeTdee(profile: UserProfileEntity): number | null {
    const { height, weight, age } = profile;
    if (height === null || weight === null || age === null) return null;
    const bmrMale = 10 * weight + 6.25 * height - 5 * age + 5;
    const bmrFemale = 10 * weight + 6.25 * height - 5 * age - 161;
    return Math.round(((bmrMale + bmrFemale) / 2) * 1.55);
}

function toProfileResponse(
    entity: UserProfileEntity,
): UserProfile & { tdee: number | null } {
    return {
        userId: entity.userId,
        height: entity.height,
        weight: entity.weight,
        age: entity.age,
        calorieGoal: entity.calorieGoal,
        proteinGoal: entity.proteinGoal,
        carbsGoal: entity.carbsGoal,
        fatGoal: entity.fatGoal,
        updatedAt: entity.updatedAt,
        tdee: computeTdee(entity),
    };
}

type ProfileResponse = APIResponsePayload<
    UserProfile & { tdee: number | null }
>;

export function profileControllerFactory() {
    const repo = AppDataSource.getRepository(UserProfileEntity);

    return {
        get: async (req: Request, res: AuthAPIResponse<ProfileResponse>) => {
            const userId = res.locals.user.sub;
            let profile = await repo.findOne({ where: { userId } });
            if (!profile) {
                profile = repo.create({
                    userId,
                    height: null,
                    weight: null,
                    age: null,
                    calorieGoal: null,
                    proteinGoal: null,
                    carbsGoal: null,
                    fatGoal: null,
                });
                await repo.save(profile);
            }
            res.json({ status: "success", data: toProfileResponse(profile) });
        },

        update: async (req: Request, res: AuthAPIResponse<ProfileResponse>) => {
            const userId = res.locals.user.sub;
            const patch: UpdateProfileRequest =
                updateProfileRequestSchema.parse(req.body);

            let profile = await repo.findOne({ where: { userId } });
            if (!profile) {
                profile = repo.create({
                    userId,
                    height: null,
                    weight: null,
                    age: null,
                    calorieGoal: null,
                    proteinGoal: null,
                    carbsGoal: null,
                    fatGoal: null,
                });
            }
            Object.assign(profile, patch);
            await repo.save(profile);
            res.json({ status: "success", data: toProfileResponse(profile) });
        },
    };
}
