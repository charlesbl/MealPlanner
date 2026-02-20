import { type NutritionInfo } from "./schemas/nutrition.schemas.js";
import {
    type EnrichRecipeBodyResponse,
    type Recipe,
    type RecipeCreateBodyResponse,
    type RecipeListBodyResponse,
    type RecipeUpdateBodyResponse,
} from "./schemas/recipe.schemas.js";
import { getApiBase } from "./utils.js";

async function fetchLibrary(token: string): Promise<Recipe[]> {
    const res = await fetch(`${getApiBase()}/recipe`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Fetch library failed: ${res.status}`);
    const body: RecipeListBodyResponse = await res.json();
    if (body.status === "error") throw new Error(body.error);
    body.data.forEach((recipe) => {
        recipe.createdAt = new Date(recipe.createdAt);
    });
    return body.data;
}

async function addRecipe(
    recipe: Omit<Recipe, "id" | "createdAt">,
    token: string,
): Promise<Recipe> {
    const res = await fetch(`${getApiBase()}/recipe`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(recipe),
    });
    if (!res.ok) throw new Error(`Add recipe failed: ${res.status}`);
    const body: RecipeCreateBodyResponse = await res.json();
    if (body.status === "error") throw new Error(body.error);
    return body.data;
}

async function updateRecipe(
    id: string,
    updates: Partial<Omit<Recipe, "id" | "createdAt">>,
    token: string,
): Promise<Recipe> {
    const res = await fetch(`${getApiBase()}/recipe/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(`Update recipe failed: ${res.status}`);
    const body: RecipeUpdateBodyResponse = await res.json();
    if (body.status === "error") throw new Error(body.error);
    return body.data;
}

async function deleteRecipe(id: string, token: string): Promise<void> {
    const res = await fetch(`${getApiBase()}/recipe/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Delete recipe failed: ${res.status}`);
}

async function enrichRecipeNutrition(
    id: string,
    nutrition: NutritionInfo,
    token: string,
): Promise<Recipe> {
    const res = await fetch(`${getApiBase()}/recipe/${id}/enrich-nutrition`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nutrition }),
    });
    if (!res.ok) throw new Error(`Enrich nutrition failed: ${res.status}`);
    const body: EnrichRecipeBodyResponse = await res.json();
    if (body.status === "error") throw new Error(body.error);
    return body.data;
}

export const libraryService = {
    fetchLibrary,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    enrichRecipeNutrition,
};
