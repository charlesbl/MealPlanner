import { requireAuth } from "@mealplanner/shared-back";
import { Router } from "express";
import { userControllerFactory } from "./user.controller.js";

export function userRouterFactory() {
    const router = Router();

    const controller = userControllerFactory();

    router.put("/:id", requireAuth, controller.update);

    return router;
}
