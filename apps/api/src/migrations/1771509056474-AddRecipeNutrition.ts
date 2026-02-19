import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRecipeNutrition1771509056474 implements MigrationInterface {
    name = "AddRecipeNutrition1771509056474";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP INDEX "public"."IDX_food_entries_user_date"`,
        );
        await queryRunner.query(`ALTER TABLE "recipes" ADD "nutrition" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "recipes" DROP COLUMN "nutrition"`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_food_entries_user_date" ON "food_entries" ("date", "user_id") `,
        );
    }
}
