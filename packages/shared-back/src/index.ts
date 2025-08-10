import { JwtUserPayload } from "@mealplanner/shared";
import type { NextFunction, Request, Response } from "express";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";

export type AuthRequestPayload = { user?: JwtUserPayload } & { token?: string };
export type AuthRequest = Request & AuthRequestPayload;

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

export function requireAuth(
    req: AuthRequest,
    res: Response,
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
        req.user = payload;
        req.token = token;
        next();
    } catch {
        return res.status(401).json({ error: "Invalid token" });
    }
}
