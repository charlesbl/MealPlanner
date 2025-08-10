import { requireAuth } from "@mealplanner/shared-back";
import { Router } from "express";
import { mealControllerFactory } from "./meal.controller.js";

export function mealRouterFactory() {
    const router = Router();
    const mealController = mealControllerFactory();
    router.get("/", requireAuth, mealController.getAll);
    router.get("/:id", requireAuth, mealController.getById);
    router.post("/", requireAuth, mealController.create);
    router.put("/:id", requireAuth, mealController.update);
    router.delete("/:id", requireAuth, mealController.delete);
    return router;
}
