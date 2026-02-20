import { requireAuth } from "@mealplanner/shared-back";
import { Router } from "express";
import { journalControllerFactory } from "./food-entry.controller.js";

export function journalRouterFactory() {
    const router = Router();
    const controller = journalControllerFactory();
    // /week must be registered before /:id to avoid route shadowing
    router.get("/week", requireAuth, controller.getWeek);
    router.get("/", requireAuth, controller.getByDate);
    router.post("/", requireAuth, controller.create);
    router.patch("/:id", requireAuth, controller.update);
    router.delete("/:id", requireAuth, controller.remove);
    return router;
}
