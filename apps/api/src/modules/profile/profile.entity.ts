import {
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryColumn,
    UpdateDateColumn,
} from "typeorm";
import type { UserEntity } from "../user/user.entity.js";

@Entity({ name: "user_profile" })
export class UserProfileEntity {
    @PrimaryColumn({ name: "user_id", type: "uuid" })
    userId!: string;

    @OneToOne("UserEntity", { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: UserEntity;

    @Column({ type: "float", nullable: true })
    height!: number | null;

    @Column({ type: "float", nullable: true })
    weight!: number | null;

    @Column({ type: "integer", nullable: true })
    age!: number | null;

    @Column({ name: "calorie_goal", type: "integer", nullable: true })
    calorieGoal!: number | null;

    @Column({ name: "protein_goal", type: "integer", nullable: true })
    proteinGoal!: number | null;

    @Column({ name: "carbs_goal", type: "integer", nullable: true })
    carbsGoal!: number | null;

    @Column({ name: "fat_goal", type: "integer", nullable: true })
    fatGoal!: number | null;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}

export default UserProfileEntity;
