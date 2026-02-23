import { requireAuth } from "@mealplanner/shared-back";
import { Router } from "express";
import { recipeControllerFactory } from "./recipe.controller.js";

export function recipeRouterFactory() {
    const router = Router();
    const controller = recipeControllerFactory();
    router.get("/", requireAuth, controller.getLibrary);
    router.get("/:id", requireAuth, controller.getById);
    router.post("/", requireAuth, controller.create);
    router.put("/:id", requireAuth, controller.update);
    router.post(
        "/:id/enrich-nutrition",
        requireAuth,
        controller.enrichNutrition,
    );
    router.delete("/:id", requireAuth, controller.remove);
    return router;
}
