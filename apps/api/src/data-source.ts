import dotenv from "dotenv";
import path from "node:path";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { fileURLToPath } from "url";
import { FoodEntryEntity } from "./modules/journal/food-entry.entity.js";
import { MealEntity } from "./modules/meal/meal.entity.js";
import { UserProfileEntity } from "./modules/profile/profile.entity.js";
import { RecipeEntity } from "./modules/recipe/recipe.entity.js";
import { ThreadEntity } from "./modules/threads/thread.entity.js";
import { UserEntity } from "./modules/user/user.entity.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

if (typeof process.env.API_DB_URL !== "string") {
    throw new Error("API_DB_URL environment variable is not set");
}

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.API_DB_URL,
    synchronize: false,
    logging: false,
    migrationsRun: process.env.NODE_ENV === "production",
    entities: [
        UserEntity,
        RecipeEntity,
        MealEntity,
        UserProfileEntity,
        FoodEntryEntity,
        ThreadEntity,
    ],
    migrations: [path.join(__dirname, "migrations/*.{ts,js}")],
});
