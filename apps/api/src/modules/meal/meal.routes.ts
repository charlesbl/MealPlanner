import { requireAuth } from "@mealplanner/shared-back";
import { Router } from "express";
import { mealControllerFactory } from "./meal.controller.js";

export function mealRouterFactory() {
    const router = Router();
    const controller = mealControllerFactory();
    router.get("/", requireAuth, controller.getLibrary);
    router.get("/:id", requireAuth, controller.getById);
    router.post("/", requireAuth, controller.create);
    router.put("/:id", requireAuth, controller.update);
    router.delete("/:id", requireAuth, controller.delete);
    return router;
}
