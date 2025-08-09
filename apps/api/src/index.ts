import { JwtUserPayload } from "@mealplanner/shared";
import { requireAuth, signToken } from "@mealplanner/shared-back";
import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import "reflect-metadata";
import { Repository } from "typeorm";
import { AppDataSource } from "./data-source.js";
import { User } from "./entities/User.js";

dotenv.config();

const PORT = Number(process.env.PORT || 3001);

async function bootstrap() {
    await AppDataSource.initialize();
    const app = express();
    app.use(cors());
    app.use(express.json());

    const usersRepo: Repository<User> = AppDataSource.getRepository(User);

    // Auth routes
    app.post("/auth/register", async (req: Request, res: Response) => {
        const { name, email, password } = req.body ?? {};
        if (!name || !email || !password) {
            return res
                .status(400)
                .json({ error: "name, email and password are required" });
        }
        try {
            const existing = await usersRepo.findOne({ where: { email } });
            if (existing)
                return res.status(409).json({ error: "Email already in use" });
            const passwordHash = await bcrypt.hash(password, 10);
            const user = usersRepo.create({
                name: String(name).trim(),
                email: String(email).toLowerCase(),
                passwordHash,
            });
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
        } catch (e) {
            console.error("[auth] register error", e);
            return res.status(500).json({ error: "Internal error" });
        }
    });

    app.post("/auth/login", async (req: Request, res: Response) => {
        const { email, password } = req.body ?? {};
        if (!email || !password) {
            return res
                .status(400)
                .json({ error: "email and password are required" });
        }
        try {
            const user = await usersRepo.findOne({
                where: { email: String(email).toLowerCase() },
            });
            if (!user)
                return res.status(401).json({ error: "Invalid credentials" });
            const ok = await bcrypt.compare(
                String(password),
                user.passwordHash
            );
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
        } catch (e) {
            console.error("[auth] login error", e);
            return res.status(500).json({ error: "Internal error" });
        }
    });

    app.get(
        "/auth/me",
        requireAuth(),
        async (req: Request & { user?: JwtUserPayload }, res: Response) => {
            try {
                if (!req.user?.sub)
                    return res.status(401).json({ error: "Unauthorized" });
                const user = await usersRepo.findOne({
                    where: { id: req.user.sub },
                });
                if (!user)
                    return res.status(404).json({ error: "User not found" });
                return res.json({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                });
            } catch (e) {
                return res.status(500).json({ error: "Internal error" });
            }
        }
    );

    // GET /users/:id - view user by id
    app.get("/users/:id", async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const user = await usersRepo.findOne({ where: { id } });
            if (!user) return res.status(404).json({ error: "User not found" });
            return res.json({
                id: user.id,
                name: user.name,
                email: user.email,
            });
        } catch (e) {
            return res.status(500).json({ error: "Internal error" });
        }
    });

    // PUT /users/:id - edit user name
    app.put("/users/:id", async (req: Request, res: Response) => {
        const { id } = req.params;
        const { name } = req.body ?? {};
        if (typeof name !== "string" || name.trim().length === 0) {
            return res.status(400).json({ error: "name is required" });
        }
        try {
            const user = await usersRepo.findOne({ where: { id } });
            if (!user) return res.status(404).json({ error: "User not found" });
            user.name = name.trim();
            await usersRepo.save(user);
            return res.json({
                id: user.id,
                name: user.name,
                email: user.email,
            });
        } catch (e) {
            return res.status(500).json({ error: "Internal error" });
        }
    });

    app.listen(PORT, () => {
        console.log(`[api] listening on http://localhost:${PORT}`);
    });
}

bootstrap().catch((err) => {
    console.error("[api] bootstrap error", err);
    process.exit(1);
});
