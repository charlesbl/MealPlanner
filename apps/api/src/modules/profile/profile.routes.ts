import { requireAuth } from "@mealplanner/shared-back";
import { Router } from "express";
import { profileControllerFactory } from "./profile.controller.js";

export function profileRouterFactory() {
    const router = Router();
    const controller = profileControllerFactory();
    router.get("/", requireAuth, controller.get);
    router.put("/", requireAuth, controller.update);
    return router;
}
