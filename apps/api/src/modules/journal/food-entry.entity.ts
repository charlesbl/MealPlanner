import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import type { FoodEntryStatus, MealType } from "@mealplanner/shared-all";
import type { UserEntity } from "../user/user.entity.js";

@Entity({ name: "food_entries" })
export class FoodEntryEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne("UserEntity", { onDelete: "CASCADE", nullable: false })
    @JoinColumn({ name: "user_id" })
    user!: UserEntity;

    @Column({ type: "text" })
    description!: string;

    @Column({ name: "date", type: "varchar", length: 10 })
    date!: string;

    @Column({
        name: "meal_type",
        type: "enum",
        enum: ["breakfast", "lunch", "dinner", "snack"],
    })
    mealType!: MealType;

    @Column({ type: "float", default: 0 })
    calories!: number;

    @Column({ type: "float", default: 0 })
    protein!: number;

    @Column({ type: "float", default: 0 })
    carbs!: number;

    @Column({ type: "float", default: 0 })
    fat!: number;

    @Column({
        type: "enum",
        enum: ["pending", "completed", "error"],
        default: "completed",
    })
    status!: FoodEntryStatus;

    @Column({
        type: "text",
        nullable: true,
        name: "error_message",
        default: null,
    })
    errorMessage!: string | null;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;
}

export default FoodEntryEntity;
