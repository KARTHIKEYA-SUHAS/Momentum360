import { MigrationInterface, QueryRunner } from "typeorm";

export class LeaveSchema1790611033336 implements MigrationInterface {
    name = 'LeaveSchema1790611033336'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."leaves_leave_type_enum" AS ENUM('CASUAL', 'SICK', 'EARNED', 'UNPAID', 'OTHER')`);
        await queryRunner.query(`CREATE TYPE "public"."leaves_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "leaves" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "employee_id" uuid NOT NULL, "leave_type" "public"."leaves_leave_type_enum" NOT NULL, "start_date" date NOT NULL, "end_date" date NOT NULL, "reason" text NOT NULL, "status" "public"."leaves_status_enum" NOT NULL DEFAULT 'PENDING', "approved_by_user_id" uuid, "approved_at" TIMESTAMP WITH TIME ZONE, "rejection_reason" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_e450684b0f472818b1756dca693" UNIQUE ("organization_id", "employee_id", "start_date", "end_date"), CONSTRAINT "PK_4153ec7270da3d07efd2e11e2a7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "leaves" ADD CONSTRAINT "FK_02055fa20056e7a31bb416b623b" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leaves" ADD CONSTRAINT "FK_29d5827b1f3a86dc19288ec69a5" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leaves" ADD CONSTRAINT "FK_bedb0f2679e3aee40b2e56bda89" FOREIGN KEY ("approved_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leaves" DROP CONSTRAINT "FK_bedb0f2679e3aee40b2e56bda89"`);
        await queryRunner.query(`ALTER TABLE "leaves" DROP CONSTRAINT "FK_29d5827b1f3a86dc19288ec69a5"`);
        await queryRunner.query(`ALTER TABLE "leaves" DROP CONSTRAINT "FK_02055fa20056e7a31bb416b623b"`);
        await queryRunner.query(`DROP TABLE "leaves"`);
        await queryRunner.query(`DROP TYPE "public"."leaves_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."leaves_leave_type_enum"`);
    }

}
