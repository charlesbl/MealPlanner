// Simple auth service for JWT-based auth

export interface AuthUser {
    id: string;
    name: string;
    email: string;
}

export interface AuthResponse {
    token: string;
    user: AuthUser;
}

function getApiBase(): string {
    const base = import.meta.env.VITE_API_URL || "http://localhost:3001";
    return base.replace(/\/$/, "");
}

export async function authRegister(
    name: string,
    email: string,
    password: string
): Promise<AuthResponse> {
    const res = await fetch(`${getApiBase()}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) throw new Error(`Register failed: ${res.status}`);
    return res.json();
}

export async function authLogin(
    email: string,
    password: string
): Promise<AuthResponse> {
    const res = await fetch(`${getApiBase()}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(`Login failed: ${res.status}`);
    return res.json();
}

export async function authMe(token: string): Promise<AuthUser> {
    const res = await fetch(`${getApiBase()}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Auth check failed: ${res.status}`);
    return res.json();
}

export function saveToken(token: string) {
    localStorage.setItem("auth_token", token);
}

export function getToken(): string | null {
    return localStorage.getItem("auth_token");
}

export function clearToken() {
    localStorage.removeItem("auth_token");
}
