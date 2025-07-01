import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddExampleViToVocabulary1735689600000 implements MigrationInterface {
    name = 'AddExampleViToVocabulary1735689600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if column already exists before adding it
        const table = await queryRunner.getTable('vocabulary');
        const exampleViColumn = table?.findColumnByName('exampleVi');

        if (!exampleViColumn) {
            await queryRunner.addColumn('vocabulary', new TableColumn({
                name: 'exampleVi',
                type: 'text',
                isNullable: true,
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if column exists before dropping it
        const table = await queryRunner.getTable('vocabulary');
        const exampleViColumn = table?.findColumnByName('exampleVi');

        if (exampleViColumn) {
            await queryRunner.dropColumn('vocabulary', 'exampleVi');
        }
    }
}
