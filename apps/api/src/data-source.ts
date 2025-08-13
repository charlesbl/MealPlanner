import dotenv from "dotenv";
import path from "node:path";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { fileURLToPath } from "url";
import { MealEntity } from "./modules/meal/meal.entity.js";
import { MealPlanEntity } from "./modules/plan/plan.entity.js";
import { UserEntity } from "./modules/user/user.entity.js";

dotenv.config();

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = Number(process.env.DB_PORT || 5432);
const DB_USER = process.env.DB_USER || "mealplanner";
const DB_PASSWORD = process.env.DB_PASSWORD || "mealplanner";
const DB_NAME = process.env.DB_NAME || "mealplanner";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const AppDataSource = new DataSource({
    type: "postgres",
    host: DB_HOST,
    port: DB_PORT,
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    synchronize: false,
    logging: false,
    entities: [UserEntity, MealEntity, MealPlanEntity],
    migrations: [path.join(__dirname, "migrations/*.{ts,js}")],
});
