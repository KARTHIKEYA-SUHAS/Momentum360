import { MigrationInterface, QueryRunner } from "typeorm";

export class AllowTeamAssignmentHistory1791303969378 implements MigrationInterface {
    name = 'AllowTeamAssignmentHistory1791303969378'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "team_work_location_assignments" DROP CONSTRAINT "UQ_956fe92deeb33ed7059eda3379b"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "team_work_location_assignments" ADD CONSTRAINT "UQ_956fe92deeb33ed7059eda3379b" UNIQUE ("organization_id", "manager_id")`);
    }

}
