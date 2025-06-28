import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateInitialSchema1702000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create User table
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

    // Create Vocabulary table
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
            isUnique: true,
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
            name: 'level',
            type: 'varchar',
            default: "'beginner'",
          },
          {
            name: 'partOfSpeech',
            type: 'varchar',
            default: "'noun'",
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

    // Create UserVocabulary table
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
            name: 'isLearned',
            type: 'boolean',
            default: false,
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
            name: 'lastReviewedAt',
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

    // Create indexes
    await queryRunner.createIndex(
      'user_vocabulary',
      new TableIndex({
        name: 'idx_user_vocabulary_user',
        columnNames: ['userId'],
      })
    );
    await queryRunner.createIndex(
      'user_vocabulary',
      new TableIndex({
        name: 'idx_user_vocabulary_vocabulary',
        columnNames: ['vocabularyId'],
      })
    );
    await queryRunner.createIndex(
      'vocabulary',
      new TableIndex({
        name: 'idx_vocabulary_level',
        columnNames: ['level'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_vocabulary');
    await queryRunner.dropTable('vocabulary');
    await queryRunner.dropTable('user');
  }
}
