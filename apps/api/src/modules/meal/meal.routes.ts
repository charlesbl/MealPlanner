import { requireAuth } from "@mealplanner/shared-back";
import { Router } from "express";
import { mealControllerFactory } from "./meal.controller.js";

export function mealRouterFactory() {
    const router = Router();
    const controller = mealControllerFactory();
    router.get("/", requireAuth, controller.get);
    router.post("/", requireAuth, controller.add);
    router.delete("/:id", requireAuth, controller.remove);
    return router;
}
