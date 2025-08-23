import dotenv from "dotenv";
import "reflect-metadata";
import { createApp } from "./app.js";
import { AppDataSource } from "./data-source.js";

dotenv.config();

if (process.env.PORT === undefined) {
    throw new Error("PORT environment variable is not set");
}
const PORT = Number(process.env.PORT);
if (isNaN(PORT) || PORT <= 0 || PORT >= 65536) {
    throw new Error("PORT environment variable is not a valid port number");
}

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
