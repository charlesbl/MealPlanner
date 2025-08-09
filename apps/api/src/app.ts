import cors from "cors";
import express, { Express, NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { buildApiRouter } from "./routes/index.js";

export type CreateAppDeps = Parameters<typeof buildApiRouter>[0];

export function createApp(deps: CreateAppDeps): Express {
    const app = express();
    app.use(cors());
    app.use(express.json());

    app.use("/", buildApiRouter(deps));

    // Not found
    app.use((req, res) => {
        res.status(404).json({ error: "Not found" });
    });

    // Error handler
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        if (err instanceof ZodError) {
            return res.status(400).json({
                error: "Validation error",
                issues: err.issues,
            });
        }
        const status = typeof err?.status === "number" ? err.status : 500;
        const message =
            typeof err?.message === "string" ? err.message : "Internal error";
        if (status >= 500) {
            console.error("[api] error", err);
        }
        return res.status(status).json({ error: message });
    });

    return app;
}
