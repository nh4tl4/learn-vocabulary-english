import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSelectedTopicsToUser1735468800000 implements MigrationInterface {
    name = 'AddSelectedTopicsToUser1735468800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "selectedTopics" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "selectedTopics"`);
    }
}
