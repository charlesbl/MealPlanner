import {
    type Meal,
    type MealCreateResponse,
    type MealListResponse,
    type MealUpdateResponse,
} from "./schemas/meal.schemas.js";

function getApiBase(): string {
    let base: string | undefined;
    // Try Vite (browser/SSR) via import.meta.env when available
    try {
        base = (import.meta as any)?.env?.VITE_API_URL;
    } catch {
        // ignore
    }
    // Fallback to Node.js environment variables via globalThis to avoid Node typings
    if (!base) {
        const proc = (globalThis as any)?.process;
        base = proc?.env?.VITE_API_URL ?? proc?.env?.API_URL;
    }
    return (base ?? "http://localhost:3001").replace(/\/$/, "");
}

export async function fetchMeals(token: string): Promise<Meal[]> {
    const res = await fetch(`${getApiBase()}/meals`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Fetch meals failed: ${res.status}`);
    const body: MealListResponse = await res.json();
    if (body.status === "error") throw new Error(body.error);
    body.data.forEach((meal) => {
        meal.createdAt = new Date(meal.createdAt);
    });
    return body.data;
}

export async function addMeal(
    meal: Omit<Meal, "id" | "createdAt">,
    token: string
): Promise<Meal> {
    const res = await fetch(`${getApiBase()}/meals`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(meal),
    });
    if (!res.ok) throw new Error(`Add meal failed: ${res.status}`);
    const body: MealCreateResponse = await res.json();
    if (body.status === "error") throw new Error(body.error);
    return body.data;
}

export async function updateMeal(
    id: string,
    updates: Partial<Omit<Meal, "id" | "createdAt">>,
    token: string
): Promise<Meal> {
    const res = await fetch(`${getApiBase()}/meals/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(`Update meal failed: ${res.status}`);
    const body: MealUpdateResponse = await res.json();
    if (body.status === "error") throw new Error(body.error);
    return body.data;
}

export async function deleteMeal(id: string, token: string): Promise<void> {
    const res = await fetch(`${getApiBase()}/meals/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Delete meal failed: ${res.status}`);
}
