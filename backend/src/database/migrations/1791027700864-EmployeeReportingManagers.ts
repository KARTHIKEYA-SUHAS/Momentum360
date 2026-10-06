import { MigrationInterface, QueryRunner } from "typeorm";

export class EmployeeReportingManagers1791027700864 implements MigrationInterface {
    name = 'EmployeeReportingManagers1791027700864'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "employee_reporting_managers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "reporting_manager_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_9eed23e4bef5fde329438324beb" UNIQUE ("employee_id", "reporting_manager_id"), CONSTRAINT "PK_0f5e98b50af7c9290bac0306862" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "employee_reporting_managers" ADD CONSTRAINT "FK_304f0114388100e2603b228a960" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_reporting_managers" ADD CONSTRAINT "FK_a2f192df5ce84ddd585858f3eb6" FOREIGN KEY ("reporting_manager_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee_reporting_managers" DROP CONSTRAINT "FK_a2f192df5ce84ddd585858f3eb6"`);
        await queryRunner.query(`ALTER TABLE "employee_reporting_managers" DROP CONSTRAINT "FK_304f0114388100e2603b228a960"`);
        await queryRunner.query(`DROP TABLE "employee_reporting_managers"`);
    }

}
