import { AuthRequest, requireAuth } from "@mealplanner/shared-back";
import { Router } from "express";
import { updateUserSchema, userIdParamSchema } from "../schemas/users.js";
import type { Deps } from "./index.js";

export function usersRouterFactory({ usersRepo }: Deps) {
    const router = Router();

    router.put("/:id", requireAuth(), async (req: AuthRequest, res, next) => {
        try {
            const { id } = userIdParamSchema.parse(req.params);
            const userId = req.user?.sub;
            if (!userId || userId !== id) {
                return res.status(403).json({ error: "Forbidden" });
            }
            const { name } = updateUserSchema.parse(req.body);
            const user = await usersRepo.findOne({ where: { id } });
            if (!user) return res.status(404).json({ error: "User not found" });
            user.name = name;
            await usersRepo.save(user);
            return res.json({
                id: user.id,
                name: user.name,
                email: user.email,
            });
        } catch (err) {
            next(err);
        }
    });

    return router;
}
