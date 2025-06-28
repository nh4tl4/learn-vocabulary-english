import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTopicToVocabulary1704000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add topic column to vocabulary table
    await queryRunner.query(`ALTER TABLE vocabulary ADD COLUMN topic TEXT`);

    // Update existing vocabulary with topics
    const topicUpdates = [
      // Family & Relationships - Gia đình & Mối quan hệ
      { words: ['mother', 'father', 'sister', 'brother', 'family', 'parent', 'child', 'baby', 'wife', 'husband'], topic: 'Gia đình' },

      // Food & Drink - Đồ ăn & Thức uống
      { words: ['food', 'water', 'bread', 'rice', 'meat', 'fish', 'fruit', 'apple', 'banana', 'orange', 'milk', 'coffee', 'tea'], topic: 'Đồ ăn & Thức uống' },

      // Animals - Động vật
      { words: ['cat', 'dog', 'bird', 'fish', 'cow', 'pig', 'chicken', 'horse', 'elephant', 'lion', 'tiger', 'bear'], topic: 'Động vật' },

      // Colors - Màu sắc
      { words: ['red', 'blue', 'green', 'yellow', 'black', 'white', 'brown', 'pink', 'purple', 'orange', 'gray'], topic: 'Màu sắc' },

      // Body Parts - Bộ phận cơ thể
      { words: ['head', 'eye', 'nose', 'mouth', 'ear', 'hand', 'foot', 'arm', 'leg', 'hair', 'face', 'body'], topic: 'Cơ thể' },

      // House & Home - Nhà cửa
      { words: ['house', 'home', 'room', 'door', 'window', 'bed', 'table', 'chair', 'kitchen', 'bathroom', 'garden'], topic: 'Nhà cửa' },

      // Clothes - Quần áo
      { words: ['shirt', 'dress', 'pants', 'shoes', 'hat', 'coat', 'jacket', 'skirt', 'socks', 'clothes'], topic: 'Quần áo' },

      // Weather - Thời tiết
      { words: ['sun', 'rain', 'snow', 'wind', 'cloud', 'hot', 'cold', 'warm', 'cool', 'weather'], topic: 'Thời tiết' },

      // Transportation - Giao thông
      { words: ['car', 'bus', 'train', 'plane', 'bike', 'boat', 'ship', 'taxi', 'truck', 'motorcycle'], topic: 'Giao thông' },

      // School & Education - Trường học
      { words: ['school', 'teacher', 'student', 'book', 'pen', 'pencil', 'paper', 'desk', 'class', 'study', 'learn'], topic: 'Trường học' },

      // Work & Jobs - Công việc
      { words: ['work', 'job', 'doctor', 'nurse', 'teacher', 'driver', 'worker', 'manager', 'engineer', 'farmer'], topic: 'Công việc' },

      // Time - Thời gian
      { words: ['time', 'day', 'night', 'morning', 'afternoon', 'evening', 'hour', 'minute', 'second', 'week', 'month', 'year'], topic: 'Thời gian' },

      // Numbers - Số đếm
      { words: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'hundred', 'thousand'], topic: 'Số đếm' },

      // Sports & Hobbies - Thể thao & Sở thích
      { words: ['play', 'game', 'ball', 'football', 'basketball', 'tennis', 'swimming', 'running', 'music', 'dance'], topic: 'Thể thao & Giải trí' },

      // Technology - Công nghệ
      { words: ['computer', 'phone', 'internet', 'email', 'website', 'software', 'technology', 'digital'], topic: 'Công nghệ' }
    ];

    // Update vocabulary with topics
    for (const topicGroup of topicUpdates) {
      for (const word of topicGroup.words) {
        await queryRunner.query(
          `UPDATE vocabulary SET topic = $1 WHERE word = $2`,
          [topicGroup.topic, word]
        );
      }
    }

    // Insert additional topic-based vocabulary
    const newVocabulary = [
      // Business - Kinh doanh
      { word: 'business', meaning: 'kinh doanh', topic: 'Kinh doanh', level: 'intermediate' },
      { word: 'company', meaning: 'công ty', topic: 'Kinh doanh', level: 'beginner' },
      { word: 'office', meaning: 'văn phòng', topic: 'Kinh doanh', level: 'beginner' },
      { word: 'meeting', meaning: 'cuộc họp', topic: 'Kinh doanh', level: 'intermediate' },
      { word: 'project', meaning: 'dự án', topic: 'Kinh doanh', level: 'intermediate' },
      { word: 'customer', meaning: 'khách hàng', topic: 'Kinh doanh', level: 'intermediate' },
      { word: 'product', meaning: 'sản phẩm', topic: 'Kinh doanh', level: 'intermediate' },
      { word: 'service', meaning: 'dịch vụ', topic: 'Kinh doanh', level: 'intermediate' },
      { word: 'market', meaning: 'thị trường', topic: 'Kinh doanh', level: 'intermediate' },
      { word: 'profit', meaning: 'lợi nhuận', topic: 'Kinh doanh', level: 'advanced' },

      // Travel - Du lịch
      { word: 'travel', meaning: 'du lịch', topic: 'Du lịch', level: 'beginner' },
      { word: 'vacation', meaning: 'kỳ nghỉ', topic: 'Du lịch', level: 'intermediate' },
      { word: 'hotel', meaning: 'khách sạn', topic: 'Du lịch', level: 'beginner' },
      { word: 'restaurant', meaning: 'nhà hàng', topic: 'Du lịch', level: 'beginner' },
      { word: 'airport', meaning: 'sân bay', topic: 'Du lịch', level: 'beginner' },
      { word: 'passport', meaning: 'hộ chiếu', topic: 'Du lịch', level: 'intermediate' },
      { word: 'ticket', meaning: 'vé', topic: 'Du lịch', level: 'beginner' },
      { word: 'luggage', meaning: 'hành lý', topic: 'Du lịch', level: 'intermediate' },
      { word: 'tourist', meaning: 'khách du lịch', topic: 'Du lịch', level: 'intermediate' },
      { word: 'adventure', meaning: 'phiêu lưu', topic: 'Du lịch', level: 'advanced' },

      // Health - Sức khỏe
      { word: 'health', meaning: 'sức khỏe', topic: 'Sức khỏe', level: 'beginner' },
      { word: 'hospital', meaning: 'bệnh viện', topic: 'Sức khỏe', level: 'beginner' },
      { word: 'medicine', meaning: 'thuốc', topic: 'Sức khỏe', level: 'intermediate' },
      { word: 'pain', meaning: 'đau', topic: 'Sức khỏe', level: 'beginner' },
      { word: 'sick', meaning: 'ốm', topic: 'Sức khỏe', level: 'beginner' },
      { word: 'healthy', meaning: 'khỏe mạnh', topic: 'Sức khỏe', level: 'beginner' },
      { word: 'exercise', meaning: 'tập thể dục', topic: 'Sức khỏe', level: 'intermediate' },
      { word: 'diet', meaning: 'chế độ ăn', topic: 'Sức khỏe', level: 'intermediate' },
      { word: 'vitamin', meaning: 'vitamin', topic: 'Sức khỏe', level: 'intermediate' },
      { word: 'treatment', meaning: 'điều trị', topic: 'Sức khỏe', level: 'advanced' },

      // Environment - Môi trường
      { word: 'environment', meaning: 'môi trường', topic: 'Môi trường', level: 'intermediate' },
      { word: 'nature', meaning: 'thiên nhiên', topic: 'Môi trường', level: 'beginner' },
      { word: 'pollution', meaning: 'ô nhiễm', topic: 'Môi trường', level: 'intermediate' },
      { word: 'recycling', meaning: 'tái chế', topic: 'Môi trường', level: 'intermediate' },
      { word: 'energy', meaning: 'năng lượng', topic: 'Môi trường', level: 'intermediate' },
      { word: 'forest', meaning: 'rừng', topic: 'Môi trường', level: 'beginner' },
      { word: 'ocean', meaning: 'đại dương', topic: 'Môi trường', level: 'beginner' },
      { word: 'climate', meaning: 'khí hậu', topic: 'Môi trường', level: 'intermediate' },
      { word: 'planet', meaning: 'hành tinh', topic: 'Môi trường', level: 'intermediate' },
      { word: 'sustainability', meaning: 'bền vững', topic: 'Môi trường', level: 'advanced' }
    ];

    for (const vocab of newVocabulary) {
      await queryRunner.query(
        `INSERT INTO vocabulary (word, meaning, topic, level, "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, NOW(), NOW()) 
         ON CONFLICT (word) DO NOTHING`,
        [vocab.word, vocab.meaning, vocab.topic, vocab.level]
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove topic column
    await queryRunner.query(`ALTER TABLE vocabulary DROP COLUMN topic`);
  }
}
