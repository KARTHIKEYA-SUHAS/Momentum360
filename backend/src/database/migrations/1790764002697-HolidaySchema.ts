import { MigrationInterface, QueryRunner } from "typeorm";

export class HolidaySchema1790764002697 implements MigrationInterface {
    name = 'HolidaySchema1790764002697'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "holidays" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "name" character varying(150) NOT NULL, "date" date NOT NULL, "description" text, "is_optional" boolean NOT NULL DEFAULT false, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_01dc2bcca5fe2661da8922d0d12" UNIQUE ("organization_id", "date", "name"), CONSTRAINT "PK_3646bdd4c3817d954d830881dfe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "holidays" ADD CONSTRAINT "FK_37e493a3178d84395c498b3a762" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "holidays" DROP CONSTRAINT "FK_37e493a3178d84395c498b3a762"`);
        await queryRunner.query(`DROP TABLE "holidays"`);
    }

}
