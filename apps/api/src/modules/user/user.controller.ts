import type { AuthRequest } from "@mealplanner/shared-back";
import type { NextFunction, Response } from "express";
import { AppDataSource } from "../../data-source.js";
import User from "./user.entity.js";
import { updateUserSchema, userIdParamSchema } from "./user.schemas.js";

export function userControllerFactory() {
    const usersRepo = AppDataSource.getRepository(User);
    const update = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { id } = userIdParamSchema.parse(req.params);
            const userId = req.user?.sub;
            if (!userId || userId !== id) {
                res.status(403).json({ error: "Forbidden" });
                return;
            }
            const { name } = updateUserSchema.parse(req.body);
            const user = await usersRepo.findOne({ where: { id } });
            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }
            user.name = name;
            await usersRepo.save(user);
            res.json({ id: user.id, name: user.name, email: user.email });
        } catch (err) {
            next(err);
        }
    };

    return { update };
}
