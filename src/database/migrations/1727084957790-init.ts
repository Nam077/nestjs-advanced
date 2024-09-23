import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1727084957790 implements MigrationInterface {
    name = 'Init1727084957790';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'user')`);
        await queryRunner.query(
            `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "email" character varying(255) NOT NULL, "password" text NOT NULL, "name" character varying(255) NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")); COMMENT ON COLUMN "users"."id" IS 'Unique identifier of the entity'; COMMENT ON COLUMN "users"."created_at" IS 'Date of creation of the entity'; COMMENT ON COLUMN "users"."updated_at" IS 'Date of the last update of the entity'; COMMENT ON COLUMN "users"."deleted_at" IS 'Date of deletion of the entity'; COMMENT ON COLUMN "users"."email" IS 'Email of the user'; COMMENT ON COLUMN "users"."password" IS 'Password of the user'; COMMENT ON COLUMN "users"."name" IS 'Name of the user'; COMMENT ON COLUMN "users"."role" IS 'Role of the user'`,
        );
        await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }
}
