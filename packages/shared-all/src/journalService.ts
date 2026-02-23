import type { APIResponsePayload } from "./schemas/common.schemas.js";
import {
    type CreateFoodEntryRequest,
    type FoodEntry,
    type UpdateFoodEntryRequest,
} from "./schemas/journal.schemas.js";
import type { NutritionInfo } from "./schemas/nutrition.schemas.js";
import { getApiBase } from "./utils.js";

async function createFoodEntry(
    body: CreateFoodEntryRequest,
    token: string,
): Promise<FoodEntry> {
    const res = await fetch(`${getApiBase()}/food-entries`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Create food entry failed: ${res.status}`);
    const payload: APIResponsePayload<FoodEntry> = await res.json();
    if (payload.status === "error") throw new Error(payload.error);
    return payload.data;
}

async function fetchByDate(
    date: string,
    token: string,
): Promise<{ entries: FoodEntry[]; totals: NutritionInfo }> {
    const url = new URL(`${getApiBase()}/food-entries`);
    url.searchParams.set("date", date);
    const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Fetch food entries failed: ${res.status}`);
    const payload: APIResponsePayload<{
        entries: FoodEntry[];
        totals: NutritionInfo;
    }> = await res.json();
    if (payload.status === "error") throw new Error(payload.error);
    return payload.data;
}

async function fetchWeek(
    startDate: string,
    token: string,
): Promise<{ days: { date: string; totals: NutritionInfo }[] }> {
    const url = new URL(`${getApiBase()}/food-entries/week`);
    url.searchParams.set("startDate", startDate);
    const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Fetch week entries failed: ${res.status}`);
    const payload: APIResponsePayload<{
        days: { date: string; totals: NutritionInfo }[];
    }> = await res.json();
    if (payload.status === "error") throw new Error(payload.error);
    return payload.data;
}

async function updateFoodEntry(
    id: string,
    body: UpdateFoodEntryRequest,
    token: string,
): Promise<FoodEntry> {
    const res = await fetch(`${getApiBase()}/food-entries/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Update food entry failed: ${res.status}`);
    const payload: APIResponsePayload<FoodEntry> = await res.json();
    if (payload.status === "error") throw new Error(payload.error);
    return payload.data;
}

async function deleteFoodEntry(id: string, token: string): Promise<void> {
    const res = await fetch(`${getApiBase()}/food-entries/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Delete food entry failed: ${res.status}`);
}

export const journalService = {
    createFoodEntry,
    updateFoodEntry,
    fetchByDate,
    fetchWeek,
    deleteFoodEntry,
};
