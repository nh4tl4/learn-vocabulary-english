import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserLevel1719686400000 implements MigrationInterface {
    name = 'AddUserLevel1719686400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "level" varchar NOT NULL DEFAULT ('beginner')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "level"`);
    }
}
