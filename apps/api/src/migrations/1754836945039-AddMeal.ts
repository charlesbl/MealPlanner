import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMeal1754836945039 implements MigrationInterface {
    name = 'AddMeal1754836945039'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "meals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text, "mealTypes" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_e6f830ac9b463433b58ad6f1a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_selection" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order" integer, "userId" uuid, "mealId" uuid, CONSTRAINT "PK_7b406d57424cd51062cc3cecef3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "meals" ADD CONSTRAINT "FK_3111c7cf13da976d7ed18287811" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_selection" ADD CONSTRAINT "FK_5982cd5ccf180301f83f6d35973" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_selection" ADD CONSTRAINT "FK_079852585833ec433066b9eff89" FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_selection" DROP CONSTRAINT "FK_079852585833ec433066b9eff89"`);
        await queryRunner.query(`ALTER TABLE "user_selection" DROP CONSTRAINT "FK_5982cd5ccf180301f83f6d35973"`);
        await queryRunner.query(`ALTER TABLE "meals" DROP CONSTRAINT "FK_3111c7cf13da976d7ed18287811"`);
        await queryRunner.query(`DROP TABLE "user_selection"`);
        await queryRunner.query(`DROP TABLE "meals"`);
    }

}
