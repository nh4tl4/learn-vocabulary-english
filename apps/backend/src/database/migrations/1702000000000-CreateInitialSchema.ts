import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateInitialSchema1702000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create User table if it doesn't exist
    const userTableExists = await queryRunner.hasTable('user');
    if (!userTableExists) {
      await queryRunner.createTable(
        new Table({
          name: 'user',
          columns: [
            {
              name: 'id',
              type: 'serial',
              isPrimary: true,
            },
            {
              name: 'email',
              type: 'varchar',
              isUnique: true,
            },
            {
              name: 'password',
              type: 'varchar',
            },
            {
              name: 'name',
              type: 'varchar',
            },
            {
              name: 'role',
              type: 'varchar',
              default: "'user'",
            },
            {
              name: 'dailyGoal',
              type: 'int',
              default: 10,
            },
            {
              name: 'currentStreak',
              type: 'int',
              default: 0,
            },
            {
              name: 'longestStreak',
              type: 'int',
              default: 0,
            },
            {
              name: 'lastStudyDate',
              type: 'date',
              isNullable: true,
            },
            {
              name: 'totalWordsLearned',
              type: 'int',
              default: 0,
            },
            {
              name: 'totalTestsTaken',
              type: 'int',
              default: 0,
            },
            {
              name: 'averageTestScore',
              type: 'int',
              default: 0,
            },
            {
              name: 'createdAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'updatedAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
          ],
        }),
        true
      );
    }

    // Create Vocabulary table if it doesn't exist
    const vocabularyTableExists = await queryRunner.hasTable('vocabulary');
    if (!vocabularyTableExists) {
      await queryRunner.createTable(
        new Table({
          name: 'vocabulary',
          columns: [
            {
              name: 'id',
              type: 'serial',
              isPrimary: true,
            },
            {
              name: 'word',
              type: 'varchar',
            },
            {
              name: 'meaning',
              type: 'varchar',
            },
            {
              name: 'pronunciation',
              type: 'varchar',
              isNullable: true,
            },
            {
              name: 'example',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'partOfSpeech',
              type: 'varchar',
              isNullable: true,
            },
            {
              name: 'level',
              type: 'varchar',
              isNullable: true,
            },
            {
              name: 'topic',
              type: 'varchar',
              isNullable: true,
            },
            {
              name: 'imageUrl',
              type: 'varchar',
              isNullable: true,
            },
            {
              name: 'createdAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'updatedAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
          ],
        }),
        true
      );
    }

    // Create UserVocabulary table if it doesn't exist
    const userVocabularyTableExists = await queryRunner.hasTable('user_vocabulary');
    if (!userVocabularyTableExists) {
      await queryRunner.createTable(
        new Table({
          name: 'user_vocabulary',
          columns: [
            {
              name: 'id',
              type: 'serial',
              isPrimary: true,
            },
            {
              name: 'userId',
              type: 'int',
            },
            {
              name: 'vocabularyId',
              type: 'int',
            },
            {
              name: 'status',
              type: 'varchar',
              default: "'new'",
            },
            {
              name: 'correctCount',
              type: 'int',
              default: 0,
            },
            {
              name: 'incorrectCount',
              type: 'int',
              default: 0,
            },
            {
              name: 'reviewCount',
              type: 'int',
              default: 0,
            },
            {
              name: 'easeFactor',
              type: 'decimal',
              precision: 3,
              scale: 2,
              default: 1.0,
            },
            {
              name: 'interval',
              type: 'int',
              default: 1,
            },
            {
              name: 'nextReviewDate',
              type: 'timestamp',
              isNullable: true,
            },
            {
              name: 'lastReviewedAt',
              type: 'timestamp',
              isNullable: true,
            },
            {
              name: 'firstLearnedDate',
              type: 'timestamp',
              isNullable: true,
            },
            {
              name: 'createdAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'updatedAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
          ],
          foreignKeys: [
            {
              columnNames: ['userId'],
              referencedColumnNames: ['id'],
              referencedTableName: 'user',
              onDelete: 'CASCADE',
            },
            {
              columnNames: ['vocabularyId'],
              referencedColumnNames: ['id'],
              referencedTableName: 'vocabulary',
              onDelete: 'CASCADE',
            },
          ],
        }),
        true
      );
    }

    // Create indexes safely - check if they exist first
    try {
      // Check if index exists before creating
      const hasUserIndex = await queryRunner.query(`
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_user_vocabulary_user'
      `);

      if (!hasUserIndex || hasUserIndex.length === 0) {
        await queryRunner.createIndex(
          'user_vocabulary',
          new TableIndex({
            name: 'idx_user_vocabulary_user',
            columnNames: ['userId'],
          })
        );
      }
    } catch (error) {
      console.log('Index idx_user_vocabulary_user already exists, skipping...');
    }

    try {
      const hasVocabularyIndex = await queryRunner.query(`
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_user_vocabulary_vocabulary'
      `);

      if (!hasVocabularyIndex || hasVocabularyIndex.length === 0) {
        await queryRunner.createIndex(
          'user_vocabulary',
          new TableIndex({
            name: 'idx_user_vocabulary_vocabulary',
            columnNames: ['vocabularyId'],
          })
        );
      }
    } catch (error) {
      console.log('Index idx_user_vocabulary_vocabulary already exists, skipping...');
    }

    try {
      const hasLevelIndex = await queryRunner.query(`
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_vocabulary_level'
      `);

      if (!hasLevelIndex || hasLevelIndex.length === 0) {
        await queryRunner.createIndex(
          'vocabulary',
          new TableIndex({
            name: 'idx_vocabulary_level',
            columnNames: ['level'],
          })
        );
      }
    } catch (error) {
      console.log('Index idx_vocabulary_level already exists, skipping...');
    }

    // Create unique index for user-vocabulary combination
    try {
      const hasUniqueIndex = await queryRunner.query(`
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_user_vocabulary_unique'
      `);

      if (!hasUniqueIndex || hasUniqueIndex.length === 0) {
        await queryRunner.createIndex(
          'user_vocabulary',
          new TableIndex({
            name: 'idx_user_vocabulary_unique',
            columnNames: ['userId', 'vocabularyId'],
            isUnique: true,
          })
        );
      }
    } catch (error) {
      console.log('Index idx_user_vocabulary_unique already exists, skipping...');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_vocabulary');
    await queryRunner.dropTable('vocabulary');
    await queryRunner.dropTable('user');
  }
}
