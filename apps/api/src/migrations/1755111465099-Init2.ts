import { MigrationInterface, QueryRunner } from "typeorm";

export class Init21755111465099 implements MigrationInterface {
    name = "Init21755111465099";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "mealPlan" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order" integer, "userId" uuid, "mealId" uuid, CONSTRAINT "PK_c87887bfeb28588bb7e8cd03a3b" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `ALTER TABLE "mealPlan" ADD CONSTRAINT "FK_42cb269aad92e952b15d3d3d8cf" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "mealPlan" ADD CONSTRAINT "FK_799201eb74995dc57c59abce9c1" FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "mealPlan" DROP CONSTRAINT "FK_799201eb74995dc57c59abce9c1"`
        );
        await queryRunner.query(
            `ALTER TABLE "mealPlan" DROP CONSTRAINT "FK_42cb269aad92e952b15d3d3d8cf"`
        );
        await queryRunner.query(`DROP TABLE "mealPlan"`);
    }
}
