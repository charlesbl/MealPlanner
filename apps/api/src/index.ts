import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import jwt, { type Secret } from "jsonwebtoken";
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

    // Simple JWT utilities
    const JWT_SECRET: Secret = process.env.JWT_SECRET || "dev-secret-change";
    const TOKEN_EXPIRES_IN = Number(
        process.env.JWT_EXPIRES_IN || 60 * 60 * 24 * 7
    ); // seconds

    function signToken(user: User) {
        return jwt.sign(
            { sub: user.id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRES_IN }
        );
    }

    function authMiddleware(
        req: Request & { user?: User },
        res: Response,
        next: NextFunction
    ) {
        const header = req.headers.authorization;
        if (!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Missing token" });
        }
        const token = header.slice("Bearer ".length);
        try {
            const payload = jwt.verify(token, JWT_SECRET) as any;
            // attach a minimal user-like object; we can refetch if needed
            req.user = {
                id: payload.sub,
                email: payload.email,
                name: payload.name,
            } as User;
            next();
        } catch (e) {
            return res.status(401).json({ error: "Invalid token" });
        }
    }

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
            const token = signToken(user);
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
            const token = signToken(user);
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
        authMiddleware,
        async (req: Request & { user?: User }, res: Response) => {
            try {
                if (!req.user?.id)
                    return res.status(401).json({ error: "Unauthorized" });
                const user = await usersRepo.findOne({
                    where: { id: req.user.id },
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
