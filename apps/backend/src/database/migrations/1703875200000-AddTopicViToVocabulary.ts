import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTopicViToVocabulary1703875200000 implements MigrationInterface {
    name = 'AddTopicViToVocabulary1703875200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if column already exists before adding it
        const table = await queryRunner.getTable('vocabulary');
        const topicViColumn = table?.findColumnByName('topicVi');

        if (!topicViColumn) {
            await queryRunner.addColumn('vocabulary', new TableColumn({
                name: 'topicVi',
                type: 'varchar',
                isNullable: true,
            }));
        }

        // Update existing records with Vietnamese topic names
        const topicMapping = {
            'food': 'Ẩm thực',
            'animals': 'Động vật',
            'body_parts': 'Bộ phận cơ thể',
            'business': 'Kinh doanh',
            'clothing': 'Trang phục',
            'colors': 'Màu sắc',
            'education': 'Giáo dục',
            'fruits': 'Trái cây',
            'health_medical': 'Y tế',
            'house_furniture': 'Nội thất',
            'sports': 'Thể thao',
            'technology': 'Công nghệ',
            'transportation': 'Giao thông',
            'travel': 'Du lịch',
            'weather': 'Thời tiết'
        };

        for (const [englishTopic, vietnameseTopic] of Object.entries(topicMapping)) {
            await queryRunner.query(
                `UPDATE vocabulary SET topicVi = ? WHERE topic = ?`,
                [vietnameseTopic, englishTopic]
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if column exists before dropping it
        const table = await queryRunner.getTable('vocabulary');
        const topicViColumn = table?.findColumnByName('topicVi');

        if (topicViColumn) {
            await queryRunner.dropColumn('vocabulary', 'topicVi');
        }
    }
}
