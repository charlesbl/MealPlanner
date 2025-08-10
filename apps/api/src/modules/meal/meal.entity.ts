import { MealType } from "@mealplanner/shared";
import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../user/user.entity.js";
import { UserSelectionEntity } from "./userSelection.entity.js";

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

    @ManyToOne(() => User, (user) => user.meals, { onDelete: "CASCADE" })
    user!: User;

    @OneToMany(() => UserSelectionEntity, (sel) => sel.meal)
    userSelections!: UserSelectionEntity[];
}

export default MealEntity;
