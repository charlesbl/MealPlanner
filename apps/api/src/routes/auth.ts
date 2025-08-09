import { AuthRequest, requireAuth, signToken } from "@mealplanner/shared-back";
import bcrypt from "bcryptjs";
import { Router } from "express";
import { loginSchema, registerSchema } from "../schemas/auth.js";

import type { Deps } from "./index.js";

export function authRouterFactory({ usersRepo }: Deps) {
    const router = Router();

    router.post("/register", async (req, res, next) => {
        try {
            const { name, email, password } = registerSchema.parse(req.body);
            const existing = await usersRepo.findOne({ where: { email } });
            if (existing)
                return res.status(409).json({ error: "Email already in use" });
            const passwordHash = await bcrypt.hash(password, 10);
            const user = usersRepo.create({ name, email, passwordHash });
            await usersRepo.save(user);
            const token = signToken({
                sub: user.id,
                email: user.email,
                name: user.name,
            });
            return res.status(201).json({
                token,
                user: { id: user.id, name: user.name, email: user.email },
            });
        } catch (err) {
            next(err);
        }
    });

    router.post("/login", async (req, res, next) => {
        try {
            const { email, password } = loginSchema.parse(req.body);
            const user = await usersRepo.findOne({ where: { email } });
            if (!user)
                return res.status(401).json({ error: "Invalid credentials" });
            const ok = await bcrypt.compare(password, user.passwordHash);
            if (!ok)
                return res.status(401).json({ error: "Invalid credentials" });
            const token = signToken({
                sub: user.id,
                email: user.email,
                name: user.name,
            });
            return res.json({
                token,
                user: { id: user.id, name: user.name, email: user.email },
            });
        } catch (err) {
            next(err);
        }
    });

    router.get("/me", requireAuth(), async (req: AuthRequest, res, next) => {
        try {
            if (!req.user?.sub)
                return res.status(401).json({ error: "Unauthorized" });
            const user = await usersRepo.findOne({
                where: { id: req.user.sub },
            });
            if (!user) return res.status(404).json({ error: "User not found" });
            return res.json({
                id: user.id,
                name: user.name,
                email: user.email,
            });
        } catch (err) {
            next(err);
        }
    });

    return router;
}
