import { RecipeType } from "@mealplanner/shared-all";
import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { PlanItemEntity } from "../planItem/planItem.entity.js";
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

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;

    @ManyToOne("UserEntity", (user: UserEntity) => user.library, {
        onDelete: "CASCADE",
    })
    user!: UserEntity;

    @OneToMany("PlanItemEntity", (sel: PlanItemEntity) => sel.recipe)
    plan!: PlanItemEntity[];
}

export default RecipeEntity;
