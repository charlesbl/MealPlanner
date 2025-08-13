import {
    type PlanAddRequest,
    type PlanAddResponse,
    type PlanListResponse,
    type PlanMeal,
    type PlanRemoveRequest,
} from "./schemas/plan.schemas.js";
import { getApiBase } from "./utils.js";

async function fetchPlan(token: string): Promise<PlanMeal[]> {
    const res = await fetch(`${getApiBase()}/plan`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Fetch plan failed: ${res.status}`);
    const body: PlanListResponse = await res.json();
    if (body.status === "error") throw new Error(body.error);
    // Ensure nested meal.createdAt is a Date
    body.data.forEach((item) => {
        if (item.meal && (item.meal as any).createdAt)
            (item.meal as any).createdAt = new Date(
                (item.meal as any).createdAt
            );
    });
    return body.data;
}

async function addToPlan(
    payload: PlanAddRequest,
    token: string
): Promise<PlanMeal> {
    const res = await fetch(`${getApiBase()}/plan/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Add to plan failed: ${res.status}`);
    const body: PlanAddResponse = await res.json();
    if (body.status === "error") throw new Error(body.error);
    if (body.data?.meal && (body.data.meal as any).createdAt)
        (body.data.meal as any).createdAt = new Date(
            (body.data.meal as any).createdAt
        );
    return body.data;
}

async function removeFromPlan(
    payload: PlanRemoveRequest,
    token: string
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
