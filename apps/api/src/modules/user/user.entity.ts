import {
    Column,
    Entity,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { MealEntity } from "../meal/meal.entity.js";
import { MealPlanEntity } from "../plan/plan.entity.js";

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

    @OneToMany(() => MealPlanEntity, (sel) => sel.user)
    plans!: MealPlanEntity[];
}

export default UserEntity;
