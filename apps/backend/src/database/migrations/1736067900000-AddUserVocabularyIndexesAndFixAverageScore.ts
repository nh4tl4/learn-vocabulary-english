import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserVocabularyIndexesAndFixAverageScore1736067900000 implements MigrationInterface {
    name = 'AddUserVocabularyIndexesAndFixAverageScore1736067900000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Change averageTestScore column type from integer to decimal
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "averageTestScore" TYPE DECIMAL(5,2)`);

        // Add indexes for user_vocabulary table to optimize performance
        await queryRunner.query(`CREATE INDEX "IDX_user_vocabulary_userId_status" ON "user_vocabulary" ("userId", "status")`);
        await queryRunner.query(`CREATE INDEX "IDX_user_vocabulary_userId_lastReviewedAt" ON "user_vocabulary" ("userId", "lastReviewedAt")`);
        await queryRunner.query(`CREATE INDEX "IDX_user_vocabulary_userId_firstLearnedDate" ON "user_vocabulary" ("userId", "firstLearnedDate")`);
        await queryRunner.query(`CREATE INDEX "IDX_user_vocabulary_userId_nextReviewDate" ON "user_vocabulary" ("userId", "nextReviewDate")`);
        await queryRunner.query(`CREATE INDEX "IDX_user_vocabulary_vocabularyId" ON "user_vocabulary" ("vocabularyId")`);
        await queryRunner.query(`CREATE INDEX "IDX_user_vocabulary_status" ON "user_vocabulary" ("status")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove indexes
        await queryRunner.query(`DROP INDEX "IDX_user_vocabulary_status"`);
        await queryRunner.query(`DROP INDEX "IDX_user_vocabulary_vocabularyId"`);
        await queryRunner.query(`DROP INDEX "IDX_user_vocabulary_userId_nextReviewDate"`);
        await queryRunner.query(`DROP INDEX "IDX_user_vocabulary_userId_firstLearnedDate"`);
        await queryRunner.query(`DROP INDEX "IDX_user_vocabulary_userId_lastReviewedAt"`);
        await queryRunner.query(`DROP INDEX "IDX_user_vocabulary_userId_status"`);

        // Change averageTestScore column type back to integer
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "averageTestScore" TYPE INTEGER`);
    }

}
