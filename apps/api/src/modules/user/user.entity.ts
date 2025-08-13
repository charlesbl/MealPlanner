import {
    Column,
    Entity,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { MealEntity } from "../meal/meal.entity.js";
import { PlanEntity } from "../plan/plan.entity.js";

@Entity({ name: "users" })
export class UserEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Index({ unique: true })
    @Column({ type: "varchar", length: 255, unique: true })
    email!: string;

    @Column({ name: "password_hash", type: "varchar", length: 255 })
    passwordHash!: string;

    @OneToMany(() => MealEntity, (meal) => meal.user)
    library!: MealEntity[];

    @OneToMany(() => PlanEntity, (sel) => sel.user)
    plans!: PlanEntity[];
}

export default UserEntity;
