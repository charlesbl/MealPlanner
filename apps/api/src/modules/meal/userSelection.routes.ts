import { requireAuth } from "@mealplanner/shared-back";
import { Router } from "express";
import { userSelectionControllerFactory } from "./userSelection.controller.js";

export function userSelectionRouterFactory() {
    const router = Router();
    const controller = userSelectionControllerFactory();
    router.get("/", requireAuth, controller.getAll);
    router.post("/add", requireAuth, controller.add);
    router.post("/remove", requireAuth, controller.remove);
    return router;
}
