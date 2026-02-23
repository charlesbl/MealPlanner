import { requireAuth } from "@mealplanner/shared-back";
import { Router } from "express";
import { threadsControllerFactory } from "./thread.controller.js";

export function threadsRouterFactory() {
    const router = Router();
    const controller = threadsControllerFactory();
    router.get("/", requireAuth, controller.list);
    router.post("/", requireAuth, controller.create);
    router.patch("/:id", requireAuth, controller.update);
    router.delete("/:id", requireAuth, controller.remove);
    return router;
}
