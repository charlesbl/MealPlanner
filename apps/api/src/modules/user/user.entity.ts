import {
    Column,
    Entity,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { MealEntity } from "../meal/meal.entity.js";
import { RecipeEntity } from "../recipe/recipe.entity.js";

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

    @OneToMany(() => RecipeEntity, (recipe) => recipe.user)
    library!: RecipeEntity[];

    @OneToMany(() => MealEntity, (meal) => meal.user)
    plans!: MealEntity[];
}

export default UserEntity;
