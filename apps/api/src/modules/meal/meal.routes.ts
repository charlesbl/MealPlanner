import { requireAuth } from "@mealplanner/shared-back";
import { Router } from "express";
import { mealControllerFactory } from "./meal.controller.js";

export function planRouterFactory() {
    const router = Router();
    const controller = mealControllerFactory();
    router.get("/", requireAuth, controller.get);
    router.post("/add", requireAuth, controller.add);
    router.post("/remove", requireAuth, controller.remove);
    return router;
}
