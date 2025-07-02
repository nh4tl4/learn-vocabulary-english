import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey, TableColumn } from 'typeorm';

export class CreateTopicTable1704196800000 implements MigrationInterface {
  name = 'CreateTopicTable1704196800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create topics table
    await queryRunner.createTable(
      new Table({
        name: 'topics',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'nameVi',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'descriptionVi',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'icon',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'displayOrder',
            type: 'integer',
            default: 0,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'vocabularyCount',
            type: 'integer',
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
      true,
    );

    // Create index on name
    await queryRunner.createIndex('topics', new TableIndex({
      name: 'IDX_topics_name',
      columnNames: ['name']
    }));

    // Add topicId column to vocabulary table
    await queryRunner.addColumn('vocabulary', new TableColumn({
      name: 'topicId',
      type: 'integer',
      isNullable: true,
    }));

    // Add topicId column to user_selected_topics table
    await queryRunner.addColumn('user_selected_topics', new TableColumn({
      name: 'topicId',
      type: 'integer',
      isNullable: true,
    }));

    // Add topicId column to user_topic_history table
    await queryRunner.addColumn('user_topic_history', new TableColumn({
      name: 'topicId',
      type: 'integer',
      isNullable: true,
    }));

    // Create foreign key constraints
    await queryRunner.createForeignKey(
      'vocabulary',
      new TableForeignKey({
        columnNames: ['topicId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'topics',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'user_selected_topics',
      new TableForeignKey({
        columnNames: ['topicId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'topics',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'user_topic_history',
      new TableForeignKey({
        columnNames: ['topicId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'topics',
        onDelete: 'SET NULL',
      }),
    );

    // Insert some default topics
    await queryRunner.query(`
      INSERT INTO topics (name, "nameVi", description, "descriptionVi", icon, "displayOrder", "isActive") VALUES
      ('actions', 'Hành động', 'Action verbs and activities', 'Động từ hành động và hoạt động', '⚡', 1, true),
      ('animals', 'Động vật', 'Animals and pets vocabulary', 'Từ vựng về động vật và thú cưng', '🐕', 2, true),
      ('arts_culture', 'Nghệ thuật và văn hóa', 'Arts and culture vocabulary', 'Từ vựng nghệ thuật và văn hóa', '🎨', 3, true),
      ('beverages', 'Đồ uống', 'Drinks and beverages', 'Đồ uống và nước giải khát', '🥤', 4, true),
      ('body_parts', 'Bộ phận cơ thể', 'Body parts and anatomy', 'Các bộ phận cơ thể và giải phẫu', '👁️', 5, true),
      ('business', 'Kinh doanh', 'Business and workplace vocabulary', 'Từ vựng kinh doanh và nơi làm việc', '💼', 6, true),
      ('chemistry', 'Hóa học', 'Chemistry terms and concepts', 'Thuật ngữ và khái niệm hóa học', '⚗️', 7, true),
      ('clothing', 'Quần áo', 'Clothing and accessories', 'Quần áo và phụ kiện', '👕', 8, true),
      ('clothing_fashion', 'Thời trang', 'Fashion and style vocabulary', 'Từ vựng thời trang và phong cách', '👗', 9, true),
      ('colors', 'Màu sắc', 'Colors and shades', 'Màu sắc và sắc thái', '🎨', 10, true),
      ('cooking', 'Nấu ăn', 'Cooking methods and kitchen tools', 'Phương pháp nấu ăn và dụng cụ nhà bếp', '👨‍🍳', 11, true),
      ('economics', 'Kinh tế học', 'Economic terms and concepts', 'Thuật ngữ và khái niệm kinh tế', '📈', 12, true),
      ('education', 'Giáo dục', 'Education and learning vocabulary', 'Từ vựng giáo dục và học tập', '📚', 13, true),
      ('emotions', 'Cảm xúc', 'Emotions and feelings', 'Cảm xúc và tình cảm', '😊', 14, true),
      ('entertainment', 'Giải trí', 'Entertainment and leisure vocabulary', 'Từ vựng giải trí và thư giãn', '🎭', 15, true),
      ('environment', 'Môi trường', 'Environment and ecology', 'Môi trường và sinh thái', '🌍', 16, true),
      ('family', 'Gia đình', 'Family members and relationships', 'Thành viên gia đình và mối quan hệ', '👨‍👩‍👧‍👦', 17, true),
      ('finance', 'Tài chính', 'Financial terms and banking', 'Thuật ngữ tài chính và ngân hàng', '💰', 18, true),
      ('food', 'Thức ăn', 'Food and meals', 'Thức ăn và bữa ăn', '🍕', 19, true),
      ('food_drink', 'Ăn uống', 'Food and drinks vocabulary', 'Từ vựng về ăn uống', '🍔', 20, true),
      ('fruits', 'Trái cây', 'Fruits and berries', 'Trái cây và quả berry', '🍎', 21, true),
      ('health', 'Sức khỏe', 'Health and medical vocabulary', 'Từ vựng y tế và sức khỏe', '🏥', 22, true),
      ('history', 'Lịch sử', 'Historical terms and events', 'Thuật ngữ và sự kiện lịch sử', '📜', 23, true),
      ('home', 'Nhà cửa', 'Home and household items', 'Nhà cửa và đồ gia dụng', '🏠', 24, true),
      ('house_home', 'Ngôi nhà', 'House parts and home vocabulary', 'Các phần của ngôi nhà và từ vựng về nhà', '🏡', 25, true),
      ('human_body', 'Cơ thể con người', 'Human body systems and organs', 'Hệ thống cơ thể và các cơ quan', '🧠', 26, true),
      ('jobs_careers', 'Nghề nghiệp', 'Jobs and career paths', 'Công việc và con đường sự nghiệp', '💼', 27, true),
      ('jobs_professions', 'Nghề nghiệp chuyên môn', 'Professional occupations', 'Các nghề nghiệp chuyên môn', '👨‍💼', 28, true),
      ('law', 'Luật pháp', 'Legal terms and concepts', 'Thuật ngữ và khái niệm pháp lý', '⚖️', 29, true),
      ('marketing', 'Tiếp thị', 'Marketing and advertising terms', 'Thuật ngữ tiếp thị và quảng cáo', '📊', 30, true),
      ('media_communication', 'Truyền thông', 'Media and communication vocabulary', 'Từ vựng truyền thông và giao tiếp', '📱', 31, true),
      ('nature', 'Thiên nhiên', 'Nature and environment vocabulary', 'Từ vựng thiên nhiên và môi trường', '🌳', 32, true),
      ('people_relationships', 'Con người và mối quan hệ', 'People and social relationships', 'Con người và mối quan hệ xã hội', '👥', 33, true),
      ('personality', 'Tính cách', 'Personality traits and characteristics', 'Đặc điểm tính cách và đặc tính', '🧑‍🎓', 34, true),
      ('physics', 'Vật lý', 'Physics terms and concepts', 'Thuật ngữ và khái niệm vật lý', '⚛️', 35, true),
      ('plants_flowers', 'Thực vật và hoa', 'Plants and flowers vocabulary', 'Từ vựng về thực vật và hoa', '🌸', 36, true),
      ('politics', 'Chính trị', 'Political terms and government', 'Thuật ngữ chính trị và chính phủ', '🏛️', 37, true),
      ('psychology', 'Tâm lý học', 'Psychology terms and mental health', 'Thuật ngữ tâm lý học và sức khỏe tâm thần', '🧠', 38, true),
      ('school', 'Trường học', 'School and academic vocabulary', 'Từ vựng trường học và học thuật', '🏫', 39, true),
      ('school_supplies', 'Đồ dùng học tập', 'School supplies and stationery', 'Đồ dùng học tập và văn phòng phẩm', '✏️', 40, true),
      ('science', 'Khoa học', 'Scientific terms and research', 'Thuật ngữ khoa học và nghiên cứu', '🔬', 41, true),
      ('shapes', 'Hình dạng', 'Geometric shapes and forms', 'Hình học và các dạng hình', '🔵', 42, true),
      ('shopping', 'Mua sắm', 'Shopping and retail vocabulary', 'Từ vựng mua sắm và bán lẻ', '🛒', 43, true),
      ('sports', 'Thể thao', 'Sports and fitness vocabulary', 'Từ vựng thể thao và thể dục', '⚽', 44, true),
      ('subjects', 'Môn học', 'Academic subjects and disciplines', 'Các môn học và ngành học', '📖', 45, true),
      ('technology', 'Công nghệ', 'Technology and digital vocabulary', 'Từ vựng công nghệ và số hóa', '💻', 46, true),
      ('time', 'Thời gian', 'Time expressions and calendar', 'Cách diễn đạt thời gian và lịch', '⏰', 47, true),
      ('transportation', 'Giao thông', 'Transportation and vehicles', 'Giao thông và phương tiện', '🚗', 48, true),
      ('travel', 'Du lịch', 'Travel and tourism vocabulary', 'Từ vựng du lịch và khám phá', '✈️', 49, true),
      ('vegetables', 'Rau củ', 'Vegetables and greens', 'Rau củ và rau xanh', '🥕', 50, true),
      ('weather', 'Thời tiết', 'Weather conditions and climate', 'Điều kiện thời tiết và khí hậu', '🌤️', 51, true)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    const vocabularyTable = await queryRunner.getTable('vocabulary');
    const userSelectedTopicsTable = await queryRunner.getTable('user_selected_topics');
    const userTopicHistoryTable = await queryRunner.getTable('user_topic_history');

    if (vocabularyTable) {
      const vocabularyForeignKey = vocabularyTable.foreignKeys.find(fk => fk.columnNames.indexOf('topicId') !== -1);
      if (vocabularyForeignKey) {
        await queryRunner.dropForeignKey('vocabulary', vocabularyForeignKey);
      }
    }

    if (userSelectedTopicsTable) {
      const userSelectedTopicsForeignKey = userSelectedTopicsTable.foreignKeys.find(fk => fk.columnNames.indexOf('topicId') !== -1);
      if (userSelectedTopicsForeignKey) {
        await queryRunner.dropForeignKey('user_selected_topics', userSelectedTopicsForeignKey);
      }
    }

    if (userTopicHistoryTable) {
      const userTopicHistoryForeignKey = userTopicHistoryTable.foreignKeys.find(fk => fk.columnNames.indexOf('topicId') !== -1);
      if (userTopicHistoryForeignKey) {
        await queryRunner.dropForeignKey('user_topic_history', userTopicHistoryForeignKey);
      }
    }

    // Drop columns
    await queryRunner.dropColumn('vocabulary', 'topicId');
    await queryRunner.dropColumn('user_selected_topics', 'topicId');
    await queryRunner.dropColumn('user_topic_history', 'topicId');

    // Drop topics table
    await queryRunner.dropTable('topics');
  }
}
