import dotenv from "dotenv";
import "reflect-metadata";
import { createApp } from "./app.js";
import { AppDataSource } from "./data-source.js";

dotenv.config();

const PORT = Number(process.env.PORT || 3001);

async function bootstrap() {
    await AppDataSource.initialize();

    const app = createApp();

    app.listen(PORT, () => {
        console.log(`[api] listening on http://localhost:${PORT}`);
    });
}

bootstrap().catch((err) => {
    console.error("[api] bootstrap error", err);
    process.exit(1);
});
