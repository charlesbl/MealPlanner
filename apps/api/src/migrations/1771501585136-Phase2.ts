import { MigrationInterface, QueryRunner } from "typeorm";

export class Phase21771501585136 implements MigrationInterface {
    name = "Phase21771501585136";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."food_entries_meal_type_enum" AS ENUM('breakfast', 'lunch', 'dinner', 'snack')`,
        );
        await queryRunner.query(
            `CREATE TABLE "food_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" text NOT NULL, "date" character varying(10) NOT NULL, "meal_type" "public"."food_entries_meal_type_enum" NOT NULL, "calories" double precision NOT NULL DEFAULT '0', "protein" double precision NOT NULL DEFAULT '0', "carbs" double precision NOT NULL DEFAULT '0', "fat" double precision NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, CONSTRAINT "PK_9ff4018d66bc4142ac2222a3ad0" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "user_profile" ("user_id" uuid NOT NULL, "height" double precision, "weight" double precision, "age" integer, "calorie_goal" integer, "protein_goal" integer, "carbs_goal" integer, "fat_goal" integer, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_eee360f3bff24af1b6890765201" PRIMARY KEY ("user_id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "threads" ("id" character varying NOT NULL, "title" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "last_message_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, CONSTRAINT "PK_d8a74804c34fc3900502cd27275" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "food_entries" ADD CONSTRAINT "FK_15c73ca44d32c87f529bc60b79f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_profile" ADD CONSTRAINT "FK_eee360f3bff24af1b6890765201" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "threads" ADD CONSTRAINT "FK_a6cc1a07ec07e376947ed1016a0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_food_entries_user_date" ON "food_entries" ("user_id", "date")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP INDEX "public"."IDX_food_entries_user_date"`,
        );
        await queryRunner.query(
            `ALTER TABLE "threads" DROP CONSTRAINT "FK_a6cc1a07ec07e376947ed1016a0"`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_profile" DROP CONSTRAINT "FK_eee360f3bff24af1b6890765201"`,
        );
        await queryRunner.query(
            `ALTER TABLE "food_entries" DROP CONSTRAINT "FK_15c73ca44d32c87f529bc60b79f"`,
        );
        await queryRunner.query(`DROP TABLE "threads"`);
        await queryRunner.query(`DROP TABLE "user_profile"`);
        await queryRunner.query(`DROP TABLE "food_entries"`);
        await queryRunner.query(
            `DROP TYPE "public"."food_entries_meal_type_enum"`,
        );
    }
}
