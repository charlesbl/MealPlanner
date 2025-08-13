import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1755111045957 implements MigrationInterface {
    name = "Init1755111045957";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "meals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text, "mealTypes" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_e6f830ac9b463433b58ad6f1a59" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "plan" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order" integer, "userId" uuid, "mealId" uuid, CONSTRAINT "PK_54a2b686aed3b637654bf7ddbb3" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `
        );
        await queryRunner.query(
            `ALTER TABLE "meals" ADD CONSTRAINT "FK_3111c7cf13da976d7ed18287811" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "plan" ADD CONSTRAINT "FK_827493784de956d80a17369b2c0" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "plan" ADD CONSTRAINT "FK_5b482d19af10d331840d397a0c1" FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "plan" DROP CONSTRAINT "FK_5b482d19af10d331840d397a0c1"`
        );
        await queryRunner.query(
            `ALTER TABLE "plan" DROP CONSTRAINT "FK_827493784de956d80a17369b2c0"`
        );
        await queryRunner.query(
            `ALTER TABLE "meals" DROP CONSTRAINT "FK_3111c7cf13da976d7ed18287811"`
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`
        );
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "plan"`);
        await queryRunner.query(`DROP TABLE "meals"`);
    }
}
