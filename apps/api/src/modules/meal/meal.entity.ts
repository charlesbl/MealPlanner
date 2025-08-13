import { MealType } from "@mealplanner/shared-all";
import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { MealPlanEntity } from "../plan/plan.entity.js";
import type { UserEntity } from "../user/user.entity.js";

@Entity({ name: "meals" })
export class MealEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "text", nullable: true })
    description?: string;

    @Column({ type: "simple-array" })
    mealTypes!: MealType[];

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;

    @ManyToOne("UserEntity", (user: UserEntity) => user.library, {
        onDelete: "CASCADE",
    })
    user!: UserEntity;

    @OneToMany("MealPlanEntity", (sel: MealPlanEntity) => sel.meal)
    plans!: MealPlanEntity[];
}

export default MealEntity;
