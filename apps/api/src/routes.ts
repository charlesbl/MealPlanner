import { Router } from "express";
import { Repository } from "typeorm";
import { authRouterFactory } from "./modules/auth/auth.routes.js";
import User from "./modules/user/user.entity.js";
import { usersRouterFactory } from "./modules/user/user.routes.js";

export type Deps = {
    usersRepo: Repository<User>;
};

export function buildApiRouter(deps: Deps) {
    const api = Router();

    // Mount domain routers (no versioning to preserve current client contracts)
    api.use("/auth", authRouterFactory(deps));
    api.use("/users", usersRouterFactory(deps));

    return api;
}
