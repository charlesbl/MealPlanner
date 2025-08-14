import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import RecipeEntity from "../recipe/recipe.entity.js";
import type { UserEntity } from "../user/user.entity.js";

// TODO rename to planEntry
@Entity({ name: "meals" })
export class MealEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne("UserEntity", (user: UserEntity) => user.plans, {
        onDelete: "CASCADE",
    })
    user!: UserEntity;

    @ManyToOne("RecipeEntity", (recipe: RecipeEntity) => recipe.plan, {
        onDelete: "CASCADE",
    })
    recipe!: RecipeEntity;

    @Column({ type: "int", nullable: true })
    order?: number;
}
