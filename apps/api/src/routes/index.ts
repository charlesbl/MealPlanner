import { Router } from "express";
import { Repository } from "typeorm";
import User from "../entities/User.js";
import { authRouterFactory } from "./auth.js";
import { usersRouterFactory } from "./users.js";

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
