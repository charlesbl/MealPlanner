import {
    type Meal,
    type PlanAddBodyRequest,
    type PlanAddBodyResponse,
    type PlanGetBodyResponse,
    type PlanRemoveBodyRequest,
} from "./schemas/meal.schemas.js";
import { getApiBase } from "./utils.js";

async function fetchPlan(token: string): Promise<Meal[]> {
    const res = await fetch(`${getApiBase()}/plan`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Fetch plan failed: ${res.status}`);
    const body: PlanGetBodyResponse = await res.json();
    if (body.status === "error") throw new Error(body.error);
    // Ensure nested recipe.createdAt is a Date
    body.data.forEach((item) => {
        item.recipe.createdAt = new Date(item.recipe.createdAt);
    });
    return body.data;
}

async function addToPlan(
    payload: PlanAddBodyRequest,
    token: string,
): Promise<Meal> {
    const res = await fetch(`${getApiBase()}/plan/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Add to plan failed: ${res.status}`);
    const body: PlanAddBodyResponse = await res.json();
    if (body.status === "error") throw new Error(body.error);
    body.data.recipe.createdAt = new Date(body.data.recipe.createdAt);
    return body.data;
}

async function removeFromPlan(
    payload: PlanRemoveBodyRequest,
    token: string,
): Promise<void> {
    const res = await fetch(`${getApiBase()}/plan/remove`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Remove from plan failed: ${res.status}`);
}

export const planService = {
    fetchPlan,
    addToPlan,
    removeFromPlan,
};
