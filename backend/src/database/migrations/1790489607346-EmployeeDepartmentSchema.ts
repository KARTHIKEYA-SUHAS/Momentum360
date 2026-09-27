import { MigrationInterface, QueryRunner } from "typeorm";

export class EmployeeDepartmentSchema1790489607346 implements MigrationInterface {
    name = 'EmployeeDepartmentSchema1790489607346'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "departments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "name" character varying(150) NOT NULL, "code" character varying(50) NOT NULL, "description" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_d477e0c22b77e0b18d3a8435c11" UNIQUE ("organization_id", "code"), CONSTRAINT "PK_839517a681a86bb84cbcc6a1e9d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."employees_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED')`);
        await queryRunner.query(`CREATE TABLE "employees" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "user_id" uuid, "employee_code" character varying(50) NOT NULL, "first_name" character varying(100) NOT NULL, "last_name" character varying(100) NOT NULL, "phone" character varying(20), "date_of_joining" date NOT NULL, "designation" character varying(100), "department_id" uuid NOT NULL, "manager_id" uuid, "status" "public"."employees_status_enum" NOT NULL DEFAULT 'ACTIVE', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_2d83c53c3e553a48dadb9722e38" UNIQUE ("user_id"), CONSTRAINT "UQ_6e44c4e9e208bff48db55095499" UNIQUE ("organization_id", "employee_code"), CONSTRAINT "REL_2d83c53c3e553a48dadb9722e3" UNIQUE ("user_id"), CONSTRAINT "PK_b9535a98350d5b26e7eb0c26af4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "departments" ADD CONSTRAINT "FK_71070628c130f2c9cd3cd5f082f" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_3d3bc4729062b93fb56b084d786" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_2d83c53c3e553a48dadb9722e38" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_678a3540f843823784b0fe4a4f2" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_bcdf921072a19dd2758a628c5c0" FOREIGN KEY ("manager_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "FK_bcdf921072a19dd2758a628c5c0"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "FK_678a3540f843823784b0fe4a4f2"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "FK_2d83c53c3e553a48dadb9722e38"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "FK_3d3bc4729062b93fb56b084d786"`);
        await queryRunner.query(`ALTER TABLE "departments" DROP CONSTRAINT "FK_71070628c130f2c9cd3cd5f082f"`);
        await queryRunner.query(`DROP TABLE "employees"`);
        await queryRunner.query(`DROP TYPE "public"."employees_status_enum"`);
        await queryRunner.query(`DROP TABLE "departments"`);
    }

}
