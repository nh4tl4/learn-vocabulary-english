import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTopicIndex1703000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add index for topic column to improve query performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_vocabulary_topic 
      ON vocabulary(topic);
    `);

    // Add composite index for topic and level for better filtering
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_vocabulary_topic_level 
      ON vocabulary(topic, level);
    `);

    // Add index for createdAt to improve pagination
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_vocabulary_created_at 
      ON vocabulary("createdAt");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_vocabulary_topic;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_vocabulary_topic_level;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_vocabulary_created_at;`);
  }
}
