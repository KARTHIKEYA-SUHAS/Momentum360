import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTeamWorkLocationAssignment1791287643266 implements MigrationInterface {
    name = 'AddTeamWorkLocationAssignment1791287643266'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."team_work_location_assignments_work_mode_enum" AS ENUM('OFFICE', 'WFH')`);
        await queryRunner.query(`CREATE TABLE "team_work_location_assignments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "manager_id" uuid NOT NULL, "work_mode" "public"."team_work_location_assignments_work_mode_enum" NOT NULL, "office_location_id" uuid, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_956fe92deeb33ed7059eda3379b" UNIQUE ("organization_id", "manager_id"), CONSTRAINT "PK_8734ca4643a99301e6eed74df63" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "team_work_location_assignments" ADD CONSTRAINT "FK_34083705f66d67c97128c122548" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_work_location_assignments" ADD CONSTRAINT "FK_996b0f304a91d72f06b4c1006b0" FOREIGN KEY ("manager_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_work_location_assignments" ADD CONSTRAINT "FK_3271207c9aff9c7586e5309fd05" FOREIGN KEY ("office_location_id") REFERENCES "office_locations"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "team_work_location_assignments" DROP CONSTRAINT "FK_3271207c9aff9c7586e5309fd05"`);
        await queryRunner.query(`ALTER TABLE "team_work_location_assignments" DROP CONSTRAINT "FK_996b0f304a91d72f06b4c1006b0"`);
        await queryRunner.query(`ALTER TABLE "team_work_location_assignments" DROP CONSTRAINT "FK_34083705f66d67c97128c122548"`);
        await queryRunner.query(`DROP TABLE "team_work_location_assignments"`);
        await queryRunner.query(`DROP TYPE "public"."team_work_location_assignments_work_mode_enum"`);
    }

}
