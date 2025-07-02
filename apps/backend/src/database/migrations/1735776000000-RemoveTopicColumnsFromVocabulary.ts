import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveTopicColumnsFromVocabulary1735776000000 implements MigrationInterface {
    name = 'RemoveTopicColumnsFromVocabulary1735776000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Remove the deprecated topic and topicVi columns from vocabulary table
        await queryRunner.query(`ALTER TABLE "vocabulary" DROP COLUMN "topic"`);
        await queryRunner.query(`ALTER TABLE "vocabulary" DROP COLUMN "topicVi"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Re-add the columns if we need to rollback
        await queryRunner.query(`ALTER TABLE "vocabulary" ADD "topic" character varying`);
        await queryRunner.query(`ALTER TABLE "vocabulary" ADD "topicVi" character varying`);
    }
}
