import {
    type Recipe,
    type RecipeCreateResponse,
    type RecipeListResponse,
    type RecipeUpdateResponse,
} from "./schemas/recipe.schemas.js";
import { getApiBase } from "./utils.js";

async function fetchLibrary(token: string): Promise<Recipe[]> {
    const res = await fetch(`${getApiBase()}/recipe`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Fetch library failed: ${res.status}`);
    const body: RecipeListResponse = await res.json();
    if (body.status === "error") throw new Error(body.error);
    body.data.forEach((recipe) => {
        recipe.createdAt = new Date(recipe.createdAt);
    });
    return body.data;
}

async function addRecipe(
    recipe: Omit<Recipe, "id" | "createdAt">,
    token: string
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
    const body: RecipeCreateResponse = await res.json();
    if (body.status === "error") throw new Error(body.error);
    return body.data;
}

async function updateRecipe(
    id: string,
    updates: Partial<Omit<Recipe, "id" | "createdAt">>,
    token: string
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
    const body: RecipeUpdateResponse = await res.json();
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

export const libraryService = {
    fetchLibrary,
    addRecipe,
    updateRecipe,
    deleteRecipe,
};
