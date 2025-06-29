import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTopicHistory1719648000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table already exists
    const tableExists = await queryRunner.hasTable('user_topic_history');

    if (!tableExists) {
      await queryRunner.query(`
        CREATE TABLE user_topic_history (
          id SERIAL PRIMARY KEY,
          "userId" INTEGER NOT NULL,
          topic VARCHAR NULL,
          "sessionCount" INTEGER DEFAULT 1,
          "wordsLearned" INTEGER DEFAULT 0,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "lastSelectedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_user_topic_history_user 
            FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE
        )
      `);

      // Create indexes
      await queryRunner.query(`
        CREATE INDEX idx_user_topic_history_user_topic 
        ON user_topic_history ("userId", topic)
      `);

      await queryRunner.query(`
        CREATE INDEX idx_user_topic_history_user_created 
        ON user_topic_history ("userId", "createdAt")
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS user_topic_history`);
  }
}
