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
    app.use(express.json());

    const usersRepo: Repository<User> = AppDataSource.getRepository(User);

    // GET /users/:id - view user by id
    app.get("/users/:id", async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const user = await usersRepo.findOne({ where: { id } });
            if (!user) return res.status(404).json({ error: "User not found" });
            return res.json(user);
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
            return res.json(user);
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
