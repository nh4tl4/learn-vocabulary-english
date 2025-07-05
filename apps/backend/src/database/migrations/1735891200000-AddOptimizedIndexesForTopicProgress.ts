import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOptimizedIndexesForTopicProgress1735891200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Critical indexes for the optimized getUserProgressByMultipleTopics query

    // 1. Composite index for user_vocabulary table - most important for performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_vocabulary_user_status 
      ON user_vocabulary("userId", status);
    `);

    // 2. Index for vocabulary.topicId (foreign key to topics table)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_vocabulary_topic_id 
      ON vocabulary("topicId");
    `);

    // 3. Composite index for vocabulary table with` level filter
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_vocabulary_topic_id_level 
      ON vocabulary("topicId", level);
    `);

    // 4. Index for topic.name for faster topic lookups
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_topics_name 
      ON topics(name);
    `);

    // 5. Index for topic.isActive for filtering active topics
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_topics_is_active 
      ON topics("isActive");
    `);

    // 6. Composite index for topics filtering and ordering
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_topics_active_order 
      ON topics("isActive", "displayOrder");
    `);

    // 7. Index for user_vocabulary.vocabularyId (foreign key)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_vocabulary_vocabulary_id 
      ON user_vocabulary("vocabularyId");
    `);

    // 8. Covering index for the most common query pattern
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_vocabulary_covering 
      ON user_vocabulary("userId", "vocabularyId", status);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_user_vocabulary_user_status;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_vocabulary_topic_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_vocabulary_topic_id_level;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_topics_name;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_topics_is_active;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_topics_active_order;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_user_vocabulary_vocabulary_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_user_vocabulary_covering;`);
  }
}
