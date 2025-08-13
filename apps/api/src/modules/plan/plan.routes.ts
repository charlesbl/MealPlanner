import { requireAuth } from "@mealplanner/shared-back";
import { Router } from "express";
import { planControllerFactory } from "./plan.controller.js";

export function planRouterFactory() {
    const router = Router();
    const controller = planControllerFactory();
    router.get("/", requireAuth, controller.getAll);
    router.post("/add", requireAuth, controller.add);
    router.post("/remove", requireAuth, controller.remove);
    return router;
}
