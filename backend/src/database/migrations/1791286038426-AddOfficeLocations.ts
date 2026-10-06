import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOfficeLocations1791286038426 implements MigrationInterface {
    name = 'AddOfficeLocations1791286038426'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "office_locations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "name" character varying(150) NOT NULL, "address" text NOT NULL, "latitude" numeric(10,7) NOT NULL, "longitude" numeric(10,7) NOT NULL, "radius_meters" integer NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_685ae29556efe5d21d2ad50e4b1" UNIQUE ("organization_id", "name"), CONSTRAINT "PK_2d30c32037ac947bbc9741cae29" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "office_locations" ADD CONSTRAINT "FK_5404fd49cdad9add9fd41ee8c8f" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "office_locations" DROP CONSTRAINT "FK_5404fd49cdad9add9fd41ee8c8f"`);
        await queryRunner.query(`DROP TABLE "office_locations"`);
    }

}
