import type { APIResponsePayload } from "./schemas/common.schemas.js";
import {
    type CreateFoodEntryRequest,
    type FoodEntry,
} from "./schemas/journal.schemas.js";
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

export const journalService = { createFoodEntry };
