import { requireAuth } from "@mealplanner/shared-back";
import { Router } from "express";
import { Deps } from "../../index.js";
import { userControllerFactory } from "./user.controller.js";

export function usersRouterFactory({ usersRepo }: Deps) {
    const router = Router();

    const controller = userControllerFactory({ usersRepo });

    router.put("/:id", requireAuth, controller.update);

    return router;
}
