import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFoodEntryStatus1771593804458 implements MigrationInterface {
    name = "AddFoodEntryStatus1771593804458";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."food_entries_status_enum" AS ENUM('pending', 'completed', 'error')`,
        );
        await queryRunner.query(
            `ALTER TABLE "food_entries" ADD "status" "public"."food_entries_status_enum" NOT NULL DEFAULT 'completed'`,
        );
        await queryRunner.query(
            `ALTER TABLE "food_entries" ADD "error_message" text`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "food_entries" DROP COLUMN "error_message"`,
        );
        await queryRunner.query(
            `ALTER TABLE "food_entries" DROP COLUMN "status"`,
        );
        await queryRunner.query(
            `DROP TYPE "public"."food_entries_status_enum"`,
        );
    }
}
