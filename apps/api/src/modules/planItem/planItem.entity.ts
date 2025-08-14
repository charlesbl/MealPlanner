import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import MealEntity from "../meal/meal.entity.js";
import type { UserEntity } from "../user/user.entity.js";

// TODO rename to planEntry
@Entity({ name: "planItems" })
export class PlanItemEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne("UserEntity", (user: UserEntity) => user.plans, {
        onDelete: "CASCADE",
    })
    user!: UserEntity;

    @ManyToOne("MealEntity", (meal: MealEntity) => meal.plan, {
        onDelete: "CASCADE",
    })
    meal!: MealEntity;

    @Column({ type: "int", nullable: true })
    order?: number;
}
