import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import type { UserEntity } from "../user/user.entity.js";
import type { MealEntity } from "./meal.entity.js";

@Entity({ name: "user_selection" })
export class UserSelectionEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne("UserEntity", (user: UserEntity) => user.userSelections, {
        onDelete: "CASCADE",
    })
    user!: UserEntity;

    @ManyToOne("MealEntity", (meal: MealEntity) => meal.userSelections, {
        onDelete: "CASCADE",
    })
    meal!: MealEntity;

    @Column({ type: "int", nullable: true })
    order?: number;
}
