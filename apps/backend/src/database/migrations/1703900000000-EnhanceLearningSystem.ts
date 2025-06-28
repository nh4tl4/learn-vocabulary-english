import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceLearningSystem1703900000000 implements MigrationInterface {
  name = 'EnhanceLearningSystem1703900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to user table
    await queryRunner.query(`
      ALTER TABLE "user" 
      ADD COLUMN IF NOT EXISTS "dailyGoal" integer DEFAULT 10,
      ADD COLUMN IF NOT EXISTS "currentStreak" integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "longestStreak" integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "lastStudyDate" date,
      ADD COLUMN IF NOT EXISTS "totalWordsLearned" integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "totalTestsTaken" integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "averageTestScore" integer DEFAULT 0
    `);

    // Create enum type for status first
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE learning_status_enum AS ENUM ('new', 'learning', 'reviewing', 'mastered', 'difficult');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Add new columns to user_vocabulary table with proper types
    await queryRunner.query(`
      ALTER TABLE "user_vocabulary"
      ADD COLUMN IF NOT EXISTS "correctCount" integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "incorrectCount" integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "reviewCount" integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "easeFactor" decimal(3,2) DEFAULT 1.0,
      ADD COLUMN IF NOT EXISTS "interval" integer DEFAULT 1,
      ADD COLUMN IF NOT EXISTS "nextReviewDate" timestamp,
      ADD COLUMN IF NOT EXISTS "lastReviewedAt" timestamp,
      ADD COLUMN IF NOT EXISTS "firstLearnedDate" timestamp
    `);

    // Add status column with enum type directly
    await queryRunner.query(`
      ALTER TABLE "user_vocabulary"
      ADD COLUMN IF NOT EXISTS "status" learning_status_enum DEFAULT 'new'
    `);

    // Create indexes for efficient queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_vocabulary_next_review" 
      ON "user_vocabulary" ("userId", "nextReviewDate")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_vocabulary_status" 
      ON "user_vocabulary" ("userId", "status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_vocabulary_next_review"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_vocabulary_status"`);

    // Remove columns from user_vocabulary
    await queryRunner.query(`
      ALTER TABLE "user_vocabulary"
      DROP COLUMN IF EXISTS "status",
      DROP COLUMN IF EXISTS "correctCount",
      DROP COLUMN IF EXISTS "incorrectCount",
      DROP COLUMN IF EXISTS "reviewCount",
      DROP COLUMN IF EXISTS "easeFactor",
      DROP COLUMN IF EXISTS "interval",
      DROP COLUMN IF EXISTS "nextReviewDate",
      DROP COLUMN IF EXISTS "lastReviewedAt",
      DROP COLUMN IF EXISTS "firstLearnedDate"
    `);

    // Remove columns from user table
    await queryRunner.query(`
      ALTER TABLE "user"
      DROP COLUMN IF EXISTS "dailyGoal",
      DROP COLUMN IF EXISTS "currentStreak",
      DROP COLUMN IF EXISTS "longestStreak",
      DROP COLUMN IF EXISTS "lastStudyDate",
      DROP COLUMN IF EXISTS "totalWordsLearned",
      DROP COLUMN IF EXISTS "totalTestsTaken",
      DROP COLUMN IF EXISTS "averageTestScore"
    `);

    // Drop enum type
    await queryRunner.query(`DROP TYPE IF EXISTS learning_status_enum`);
  }
}
