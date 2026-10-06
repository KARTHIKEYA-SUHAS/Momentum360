import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWorkLocationToAttendance1791293411614 implements MigrationInterface {
    name = 'AddWorkLocationToAttendance1791293411614'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."attendance_work_mode_enum" AS ENUM('OFFICE', 'WFH')`);
        await queryRunner.query(`ALTER TABLE "attendance" ADD "work_mode" "public"."attendance_work_mode_enum"`);
        await queryRunner.query(`ALTER TABLE "attendance" ADD "check_in_latitude" numeric(10,7)`);
        await queryRunner.query(`ALTER TABLE "attendance" ADD "check_in_longitude" numeric(10,7)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance" DROP COLUMN "check_in_longitude"`);
        await queryRunner.query(`ALTER TABLE "attendance" DROP COLUMN "check_in_latitude"`);
        await queryRunner.query(`ALTER TABLE "attendance" DROP COLUMN "work_mode"`);
        await queryRunner.query(`DROP TYPE "public"."attendance_work_mode_enum"`);
    }

}
