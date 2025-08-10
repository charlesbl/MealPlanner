import { Router } from "express";

import { authRouterFactory } from "./modules/auth/auth.routes.js";
import { mealRouterFactory } from "./modules/meal/meal.routes.js";
import { userSelectionRouterFactory } from "./modules/meal/userSelection.routes.js";
import { usersRouterFactory } from "./modules/user/user.routes.js";

export function buildApiRouter() {
    const api = Router();

    // Mount domain routers (no versioning to preserve current client contracts)

    api.use("/auth", authRouterFactory());
    api.use("/users", usersRouterFactory());
    api.use("/meals", mealRouterFactory());
    api.use("/selection", userSelectionRouterFactory());

    return api;
}
