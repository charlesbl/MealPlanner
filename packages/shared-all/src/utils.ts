export function getApiBase(): string {
    let base: string | undefined;
    // Try Vite (browser/SSR) via import.meta.env when available
    try {
        base = (import.meta as any).env?.VITE_API_URL;
    } catch {
        // ignore
    }
    // Fallback to Node.js environment variables via globalThis to avoid Node typings
    if (base === undefined) {
        const proc = (globalThis as any)?.process;
        base = proc?.env?.VITE_API_URL ?? proc?.env?.API_URL;
    }
    if (base === undefined)
        throw new Error(
            "API base URL is not defined in environment variables, use VITE_API_URL or API_URL"
        );

    return base.replace(/\/$/, "");
}

export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
