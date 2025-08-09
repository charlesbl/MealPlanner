import dotenv from "dotenv";
import "reflect-metadata";
import { Repository } from "typeorm";
import { createApp } from "./app.js";
import { AppDataSource } from "./data-source.js";
import { User } from "./modules/user/user.entity.js";

dotenv.config();

export type Deps = {
    usersRepo: Repository<User>;
};

const PORT = Number(process.env.PORT || 3001);

async function bootstrap() {
    await AppDataSource.initialize();
    const usersRepo: Repository<User> = AppDataSource.getRepository(User);

    const app = createApp({ usersRepo });

    app.listen(PORT, () => {
        console.log(`[api] listening on http://localhost:${PORT}`);
    });
}

bootstrap().catch((err) => {
    console.error("[api] bootstrap error", err);
    process.exit(1);
});
