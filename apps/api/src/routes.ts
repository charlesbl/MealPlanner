import { Router } from "express";
import { Deps } from "./index.js";
import { authRouterFactory } from "./modules/auth/auth.routes.js";
import { usersRouterFactory } from "./modules/user/user.routes.js";

export function buildApiRouter(deps: Deps) {
    const api = Router();

    // Mount domain routers (no versioning to preserve current client contracts)
    api.use("/auth", authRouterFactory(deps));
    api.use("/users", usersRouterFactory(deps));

    return api;
}
