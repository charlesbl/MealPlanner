import { type NutritionInfo, RecipeType } from "@mealplanner/shared-all";
import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { MealEntity } from "../meal/meal.entity.js";
import type { UserEntity } from "../user/user.entity.js";

@Entity({ name: "recipes" })
export class RecipeEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "text", nullable: true })
    description?: string;

    @Column({ type: "simple-array" })
    recipeTypes!: RecipeType[];

    @Column({ type: "jsonb", nullable: true })
    nutrition?: NutritionInfo;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;

    @ManyToOne("UserEntity", (user: UserEntity) => user.library, {
        onDelete: "CASCADE",
    })
    user!: UserEntity;

    @OneToMany("MealEntity", (meal: MealEntity) => meal.recipe)
    plan!: MealEntity[];
}

export default RecipeEntity;
