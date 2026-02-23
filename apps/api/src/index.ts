import dotenv from "dotenv";
import "reflect-metadata";
import path from "node:path";
import { fileURLToPath } from "url";
import { createApp } from "./app.js";
import { AppDataSource } from "./data-source.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

if (process.env.API_PORT === undefined) {
    throw new Error("API_PORT environment variable is not set");
}
const PORT = Number(process.env.API_PORT);
if (isNaN(PORT) || PORT <= 0 || PORT >= 65536) {
    throw new Error("API_PORT environment variable is not a valid port number");
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
