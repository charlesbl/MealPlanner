import { requireAuth } from "@mealplanner/shared-back";
import { Router } from "express";
import { Deps } from "../../index.js";
import { authControllerFactory } from "./auth.controller.js";

export function authRouterFactory({ usersRepo }: Deps) {
    const router = Router();

    const controller = authControllerFactory({ usersRepo });

    router.post("/register", controller.register);
    router.post("/login", controller.login);
    router.get("/me", requireAuth, controller.me);

    return router;
}
