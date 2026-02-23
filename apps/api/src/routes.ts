import { Router } from "express";

import { authRouterFactory } from "./modules/auth/auth.routes.js";
import { journalRouterFactory } from "./modules/journal/food-entry.routes.js";
import { planRouterFactory } from "./modules/meal/meal.routes.js";
import { profileRouterFactory } from "./modules/profile/profile.routes.js";
import { recipeRouterFactory } from "./modules/recipe/recipe.routes.js";
import { threadsRouterFactory } from "./modules/threads/thread.routes.js";
import { userRouterFactory } from "./modules/user/user.routes.js";

export function buildApiRouter() {
    const api = Router();

    // Mount domain routers (no versioning to preserve current client contracts)

    api.use("/auth", authRouterFactory());
    api.use("/user", userRouterFactory());
    api.use("/recipe", recipeRouterFactory());
    api.use("/plan", planRouterFactory());
    api.use("/profile", profileRouterFactory());
    api.use("/food-entries", journalRouterFactory());
    api.use("/threads", threadsRouterFactory());

    return api;
}
