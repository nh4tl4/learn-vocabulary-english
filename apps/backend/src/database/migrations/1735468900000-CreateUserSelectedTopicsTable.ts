import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserSelectedTopicsTable1735468900000 implements MigrationInterface {
    name = 'CreateUserSelectedTopicsTable1735468900000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create user_selected_topics table
        await queryRunner.query(`
            CREATE TABLE "user_selected_topics" (
                "id" SERIAL NOT NULL,
                "userId" integer NOT NULL,
                "topic" character varying NOT NULL,
                "selectedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_user_selected_topics" PRIMARY KEY ("id")
            )
        `);

        // Create unique index for userId + topic combination
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_user_selected_topics_userId_topic" 
            ON "user_selected_topics" ("userId", "topic")
        `);

        // Add foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "user_selected_topics" 
            ADD CONSTRAINT "FK_user_selected_topics_userId" 
            FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "user_selected_topics" 
            DROP CONSTRAINT "FK_user_selected_topics_userId"
        `);

        // Drop unique index
        await queryRunner.query(`DROP INDEX "IDX_user_selected_topics_userId_topic"`);

        // Drop table
        await queryRunner.query(`DROP TABLE "user_selected_topics"`);
    }
}
