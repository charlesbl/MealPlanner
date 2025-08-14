import { Router } from "express";

import { authRouterFactory } from "./modules/auth/auth.routes.js";
import { planRouterFactory } from "./modules/planItem/planItem.routes.js";
import { recipeRouterFactory } from "./modules/recipe/recipe.routes.js";
import { userRouterFactory } from "./modules/user/user.routes.js";

export function buildApiRouter() {
    const api = Router();

    // Mount domain routers (no versioning to preserve current client contracts)

    api.use("/auth", authRouterFactory());
    api.use("/user", userRouterFactory());
    api.use("/recipe", recipeRouterFactory());
    api.use("/plan", planRouterFactory());

    return api;
}
