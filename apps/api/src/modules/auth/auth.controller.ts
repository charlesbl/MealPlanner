import type { AuthRequest } from "@mealplanner/shared-back";
import { signToken } from "@mealplanner/shared-back";
import bcrypt from "bcryptjs";
import type { NextFunction, Request, Response } from "express";
import { Deps } from "../../index.js";
import { loginSchema, registerSchema } from "./auth.schemas.js";

export function authControllerFactory({ usersRepo }: Deps) {
    const register = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { name, email, password } = registerSchema.parse(req.body);
            const existing = await usersRepo.findOne({ where: { email } });
            if (existing) {
                res.status(409).json({ error: "Email already in use" });
                return;
            }
            const passwordHash = await bcrypt.hash(password, 10);
            const user = usersRepo.create({ name, email, passwordHash });
            await usersRepo.save(user);
            const token = signToken({
                sub: user.id,
                email: user.email,
                name: user.name,
            });
            res.status(201).json({
                token,
                user: { id: user.id, name: user.name, email: user.email },
            });
            return;
        } catch (err) {
            next(err);
        }
    };

    const login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = loginSchema.parse(req.body);
            const user = await usersRepo.findOne({ where: { email } });
            if (!user) {
                res.status(401).json({ error: "Invalid credentials" });
                return;
            }
            const ok = await bcrypt.compare(password, user.passwordHash);
            if (!ok) {
                res.status(401).json({ error: "Invalid credentials" });
                return;
            }
            const token = signToken({
                sub: user.id,
                email: user.email,
                name: user.name,
            });
            res.json({
                token,
                user: { id: user.id, name: user.name, email: user.email },
            });
            return;
        } catch (err) {
            next(err);
        }
    };

    const me = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const authReq = req;
            if (!authReq.user?.sub) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            const user = await usersRepo.findOne({
                where: { id: authReq.user.sub },
            });
            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }
            res.json({ id: user.id, name: user.name, email: user.email });
            return;
        } catch (err) {
            next(err);
        }
    };

    return { register, login, me };
}
