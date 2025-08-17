import { JwtUserPayload } from "@mealplanner/shared-all";
import type { NextFunction, Request, Response } from "express";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { APIResponsePayload } from "../../shared-all/dist/schemas/common.schemas.js";

export function getJwtSecret(): Secret {
    return (
        (process.env.JWT_SECRET as Secret) || ("dev-secret-change" as Secret)
    );
}

export function verifyToken<T extends JwtUserPayload = JwtUserPayload>(
    token: string,
    secret: Secret = getJwtSecret()
): T {
    return jwt.verify(token, secret) as T;
}

export function signToken(
    payload: JwtUserPayload,
    options?: { secret?: Secret; expiresInSeconds?: number }
): string {
    const secret = options?.secret ?? getJwtSecret();
    const expiresIn = options?.expiresInSeconds ?? 60 * 60 * 24 * 7;
    const signOpts: SignOptions = { expiresIn };
    return jwt.sign(payload, secret, signOpts);
}

export type APIResponse<T> = Response<APIResponsePayload<T>>;
type AuthPayload = { user: JwtUserPayload; token: string };
type DataOf<T> = T extends APIResponsePayload<infer D> ? D : T;
export type AuthAPIResponse<T = never> = Response<
    APIResponsePayload<DataOf<T>>,
    AuthPayload
>;

export function requireAuth(
    req: Request,
    res: Response<any, Partial<AuthPayload>>,
    next: NextFunction
) {
    const secret = getJwtSecret();
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing token" });
    }
    const token = header.slice("Bearer ".length);
    try {
        const payload = verifyToken(token, secret);
        res.locals.user = payload;
        res.locals.token = token;
        next();
    } catch {
        return res.status(401).json({ error: "Invalid token" });
    }
}
