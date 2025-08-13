// Simple auth service for JWT-based auth

import type {
    AuthLoginResponse,
    AuthMeResponse,
    AuthRegisterResponse,
    AuthUser,
    AuthUserWithToken,
} from "@mealplanner/shared-all";

function getApiBase(): string {
    const base = import.meta.env.VITE_API_URL || "http://localhost:3001";
    return base.replace(/\/$/, "");
}

async function authRegister(
    name: string,
    email: string,
    password: string
): Promise<AuthUserWithToken> {
    const res = await fetch(`${getApiBase()}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) throw new Error(`Register failed: ${res.status}`);
    const body: AuthRegisterResponse = await res.json();
    if (body.status === "error") throw new Error(body.error);
    return body.data;
}

async function authLogin(
    email: string,
    password: string
): Promise<AuthUserWithToken> {
    const res = await fetch(`${getApiBase()}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(`Login failed: ${res.status}`);
    const body: AuthLoginResponse = await res.json();
    if (body.status === "error") throw new Error(body.error);
    return body.data;
}

async function authMe(token: string): Promise<AuthUser> {
    const res = await fetch(`${getApiBase()}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Auth check failed: ${res.status}`);
    const body: AuthMeResponse = await res.json();
    if (body.status === "error") throw new Error(body.error);
    return body.data;
}

function saveToken(token: string) {
    localStorage.setItem("auth_token", token);
}

function getToken(): string | null {
    return localStorage.getItem("auth_token");
}

function clearToken() {
    localStorage.removeItem("auth_token");
}

export const authService = {
    authRegister,
    authLogin,
    authMe,
    saveToken,
    getToken,
    clearToken,
};
