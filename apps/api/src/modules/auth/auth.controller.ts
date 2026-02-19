import {
    AuthLoginBodyResponse,
    AuthMeBodyResponse,
    AuthRegisterBodyResponse,
    loginSchema,
    registerSchema,
} from "@mealplanner/shared-all";
import { AuthAPIResponse, signToken } from "@mealplanner/shared-back";
import bcrypt from "bcryptjs";
import type { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../../data-source.js";
import UserEntity from "../user/user.entity.js";

export function authControllerFactory() {
    const usersRepo = AppDataSource.getRepository(UserEntity);
    const register = async (
        req: Request,
        res: Response<AuthRegisterBodyResponse>,
        next: NextFunction,
    ) => {
        try {
            const { name, email, password } = registerSchema.parse(req.body);
            const existing = await usersRepo.findOne({ where: { email } });
            if (existing) {
                res.status(409).json({
                    status: "error",
                    error: "Email already in use",
                });
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
                status: "success",
                data: {
                    token,
                    user: { id: user.id, name: user.name, email: user.email },
                },
            });
            return;
        } catch (err) {
            next(err);
        }
    };

    const login = async (
        req: Request,
        res: Response<AuthLoginBodyResponse>,
        next: NextFunction,
    ) => {
        try {
            const { email, password } = loginSchema.parse(req.body);
            const user = await usersRepo.findOne({ where: { email } });
            if (!user) {
                res.status(401).json();
                return;
            }
            const ok = await bcrypt.compare(password, user.passwordHash);
            if (!ok) {
                res.status(401).json({
                    status: "error",
                    error: "Invalid credentials",
                });
                return;
            }
            const token = signToken({
                sub: user.id,
                email: user.email,
                name: user.name,
            });
            res.json({
                status: "success",
                data: {
                    token,
                    user: { id: user.id, name: user.name, email: user.email },
                },
            });
            return;
        } catch (err) {
            next(err);
        }
    };

    const me = async (
        req: Request,
        res: AuthAPIResponse<AuthMeBodyResponse>,
        next: NextFunction,
    ) => {
        try {
            const user = await usersRepo.findOne({
                where: { id: res.locals.user.sub },
            });
            if (!user) {
                res.status(404).json({
                    status: "error",
                    error: "User not found",
                });
                return;
            }
            res.json({
                status: "success",
                data: { id: user.id, name: user.name, email: user.email },
            });
            return;
        } catch (err) {
            next(err);
        }
    };

    return { register, login, me };
}
