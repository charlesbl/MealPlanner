import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
} from "typeorm";
import type { UserEntity } from "../user/user.entity.js";

@Entity({ name: "threads" })
export class ThreadEntity {
    @PrimaryColumn({ type: "varchar" })
    id!: string;

    @ManyToOne("UserEntity", { onDelete: "CASCADE", nullable: false })
    @JoinColumn({ name: "user_id" })
    user!: UserEntity;

    @Column({ type: "varchar", length: 255 })
    title!: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @Column({
        name: "last_message_at",
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
    })
    lastMessageAt!: Date;
}

export default ThreadEntity;
