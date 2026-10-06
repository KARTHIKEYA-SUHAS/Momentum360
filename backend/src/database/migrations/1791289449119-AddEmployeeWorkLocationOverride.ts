import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmployeeWorkLocationOverride1791289449119 implements MigrationInterface {
    name = 'AddEmployeeWorkLocationOverride1791289449119'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."employee_work_location_overrides_work_mode_enum" AS ENUM('OFFICE', 'WFH')`);
        await queryRunner.query(`CREATE TABLE "employee_work_location_overrides" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "employee_id" uuid NOT NULL, "work_mode" "public"."employee_work_location_overrides_work_mode_enum" NOT NULL, "office_location_id" uuid, "start_date" date NOT NULL, "end_date" date, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_ab6d4e61de01a078a47a802d026" UNIQUE ("organization_id", "employee_id", "start_date"), CONSTRAINT "PK_13b14d0e03030490a594ae2087b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "employee_work_location_overrides" ADD CONSTRAINT "FK_1c979e10f004a66309550b8c5e9" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_work_location_overrides" ADD CONSTRAINT "FK_d911e6cdc49b089c0cba7f2fd79" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_work_location_overrides" ADD CONSTRAINT "FK_4029881c35d36c8ca0291eea28b" FOREIGN KEY ("office_location_id") REFERENCES "office_locations"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee_work_location_overrides" DROP CONSTRAINT "FK_4029881c35d36c8ca0291eea28b"`);
        await queryRunner.query(`ALTER TABLE "employee_work_location_overrides" DROP CONSTRAINT "FK_d911e6cdc49b089c0cba7f2fd79"`);
        await queryRunner.query(`ALTER TABLE "employee_work_location_overrides" DROP CONSTRAINT "FK_1c979e10f004a66309550b8c5e9"`);
        await queryRunner.query(`DROP TABLE "employee_work_location_overrides"`);
        await queryRunner.query(`DROP TYPE "public"."employee_work_location_overrides_work_mode_enum"`);
    }

}
