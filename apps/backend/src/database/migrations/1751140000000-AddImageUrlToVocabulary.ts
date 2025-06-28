import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImageUrlToVocabulary1751140000000 implements MigrationInterface {
    name = 'AddImageUrlToVocabulary1751140000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vocabulary" ADD "imageUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vocabulary" DROP COLUMN "imageUrl"`);
    }
}
