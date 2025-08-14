import { requireAuth } from "@mealplanner/shared-back";
import { Router } from "express";
import { planItemControllerFactory } from "./planItem.controller.js";

export function planRouterFactory() {
    const router = Router();
    const controller = planItemControllerFactory();
    router.get("/", requireAuth, controller.get);
    router.post("/add", requireAuth, controller.add);
    router.post("/remove", requireAuth, controller.remove);
    return router;
}
