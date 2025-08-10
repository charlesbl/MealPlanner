import { requireAuth } from "@mealplanner/shared-back";
import { Router } from "express";
import { authControllerFactory } from "./auth.controller.js";

export function authRouterFactory() {
    const router = Router();

    const controller = authControllerFactory();

    router.post("/register", controller.register);
    router.post("/login", controller.login);
    router.get("/me", requireAuth, controller.me);

    return router;
}
