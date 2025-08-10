import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/user.entity.js";
import { MealEntity } from "./meal.entity.js";

@Entity({ name: "user_selection" })
export class UserSelectionEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User, (user) => user.userSelections, {
        onDelete: "CASCADE",
    })
    user!: User;

    @ManyToOne(() => MealEntity, (meal) => meal.userSelections, {
        onDelete: "CASCADE",
    })
    meal!: MealEntity;

    @Column({ type: "int", nullable: true })
    order?: number;
}
