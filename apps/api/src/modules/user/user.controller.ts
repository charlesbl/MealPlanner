import {
    updateUserSchema,
    userIdParamSchema,
    type UserUpdateResponse,
} from "@mealplanner/shared-all";
import type { AuthRequest } from "@mealplanner/shared-back";
import type { NextFunction, Response } from "express";
import { AppDataSource } from "../../data-source.js";
import UserEntity from "./user.entity.js";

export function userControllerFactory() {
    const usersRepo = AppDataSource.getRepository(UserEntity);
    // TODO: Implement it in frontend
    const update = async (
        req: AuthRequest,
        res: Response<UserUpdateResponse>,
        next: NextFunction
    ) => {
        try {
            const { id } = userIdParamSchema.parse(req.params);
            const userId = req.user?.sub;
            if (!userId || userId !== id) {
                res.status(403).json({ status: "error", error: "Forbidden" });
                return;
            }
            const { name } = updateUserSchema.parse(req.body);
            const user = await usersRepo.findOne({ where: { id } });
            if (!user) {
                res.status(404).json({
                    status: "error",
                    error: "User not found",
                });
                return;
            }
            user.name = name;
            await usersRepo.save(user);
            res.json({
                status: "success",
                data: { id: user.id, name: user.name, email: user.email },
            });
        } catch (err) {
            next(err);
        }
    };

    return { update };
}
