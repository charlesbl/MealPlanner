import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuthToUser1754735000000 implements MigrationInterface {
    name = "AddAuthToUser1754735000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1) Add nullable columns to avoid failing on existing rows
        await queryRunner.query(
            `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email" character varying(255)`
        );
        await queryRunner.query(
            `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" character varying(255)`
        );
        // 2) Backfill existing rows with placeholder values if needed
        await queryRunner.query(
            `UPDATE "users" SET "email" = COALESCE("email", CONCAT("id", '@example.local'))`
        );
        await queryRunner.query(
            `UPDATE "users" SET "password_hash" = COALESCE("password_hash", '')`
        );
        // 3) Now set NOT NULL
        await queryRunner.query(
            `ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL`
        );
        // 4) Unique index on email
        await queryRunner.query(
            `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_users_email_unique" ON "users" ("email")`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP INDEX IF EXISTS "IDX_users_email_unique"`
        );
        await queryRunner.query(
            `ALTER TABLE "users" DROP COLUMN IF EXISTS "password_hash"`
        );
        await queryRunner.query(
            `ALTER TABLE "users" DROP COLUMN IF EXISTS "email"`
        );
    }
}
