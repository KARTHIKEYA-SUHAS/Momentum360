import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotifications1791300731441 implements MigrationInterface {
    name = 'CreateNotifications1791300731441'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "recipient_user_id" uuid NOT NULL, "type" character varying(100) NOT NULL, "title" character varying(200) NOT NULL, "message" text NOT NULL, "is_read" boolean NOT NULL DEFAULT false, "read_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3b0b493a18132a3355698c9ccb" ON "notifications"  ("organization_id", "recipient_user_id", "created_at") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_3b0b493a18132a3355698c9ccb"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
    }

}
