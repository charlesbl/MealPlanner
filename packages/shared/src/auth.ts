export interface JwtUserPayload {
    sub: string;
    email?: string;
    name?: string;
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
}

export interface AuthResponse {
    token: string;
    user: AuthUser;
}
