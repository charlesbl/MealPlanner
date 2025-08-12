// Domain types shared across services

// Utils
export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export * from "./mealService.js";

// Schemas
export * from "./schemas/auth.schemas.js";
export * from "./schemas/meal.schemas.js";
export * from "./schemas/user.schemas.js";
export * from "./streamChat.types.js";
