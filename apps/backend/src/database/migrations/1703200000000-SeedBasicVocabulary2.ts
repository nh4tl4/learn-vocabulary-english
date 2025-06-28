import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedBasicVocabulary21703200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO vocabulary (word, meaning, pronunciation, example, level, "partOfSpeech", "createdAt", "updatedAt") VALUES
      -- Household Items
      ('table', 'bàn', 'ˈteɪbl', 'Put the book on the table.', 'beginner', 'noun', NOW(), NOW()),
      ('chair', 'ghế', 'tʃer', 'Sit on the chair.', 'beginner', 'noun', NOW(), NOW()),
      ('bed', 'giường', 'bed', 'I sleep on my bed.', 'beginner', 'noun', NOW(), NOW()),
      ('door', 'cửa', 'dɔːr', 'Close the door, please.', 'beginner', 'noun', NOW(), NOW()),
      ('window', 'cửa sổ', 'ˈwɪndoʊ', 'Open the window for fresh air.', 'beginner', 'noun', NOW(), NOW()),
      ('kitchen', 'nhà bếp', 'ˈkɪtʃɪn', 'My mother cooks in the kitchen.', 'beginner', 'noun', NOW(), NOW()),
      ('bathroom', 'phòng tắm', 'ˈbæθruːm', 'The bathroom is upstairs.', 'beginner', 'noun', NOW(), NOW()),
      ('bedroom', 'phòng ngủ', 'ˈbedruːm', 'My bedroom is small.', 'beginner', 'noun', NOW(), NOW()),
      ('living room', 'phòng khách', 'ˈlɪvɪŋ ruːm', 'We watch TV in the living room.', 'beginner', 'noun', NOW(), NOW()),
      ('lamp', 'đèn', 'læmp', 'Turn on the lamp.', 'beginner', 'noun', NOW(), NOW()),
      ('television', 'tivi', 'ˈtelɪvɪʒn', 'I watch television every evening.', 'beginner', 'noun', NOW(), NOW()),
      ('phone', 'điện thoại', 'foʊn', 'Answer the phone.', 'beginner', 'noun', NOW(), NOW()),
      ('computer', 'máy tính', 'kəmˈpjuːtər', 'I use my computer for work.', 'beginner', 'noun', NOW(), NOW()),
      ('refrigerator', 'tủ lạnh', 'rɪˈfrɪdʒəreɪtər', 'Keep the milk in the refrigerator.', 'beginner', 'noun', NOW(), NOW()),
      ('stove', 'bếp', 'stoʊv', 'Cook the soup on the stove.', 'beginner', 'noun', NOW(), NOW()),

      -- Transportation
      ('bus', 'xe buýt', 'bʌs', 'I take the bus to work.', 'beginner', 'noun', NOW(), NOW()),
      ('train', 'tàu hỏa', 'treɪn', 'The train is fast.', 'beginner', 'noun', NOW(), NOW()),
      ('plane', 'máy bay', 'pleɪn', 'We fly by plane.', 'beginner', 'noun', NOW(), NOW()),
      ('bicycle', 'xe đạp', 'ˈbaɪsɪkl', 'I ride my bicycle to school.', 'beginner', 'noun', NOW(), NOW()),
      ('motorcycle', 'xe máy', 'ˈmoʊtərsaɪkl', 'He drives a motorcycle.', 'beginner', 'noun', NOW(), NOW()),
      ('truck', 'xe tải', 'trʌk', 'The truck carries goods.', 'beginner', 'noun', NOW(), NOW()),
      ('taxi', 'taxi', 'ˈtæksi', 'Call a taxi for me.', 'beginner', 'noun', NOW(), NOW()),
      ('boat', 'thuyền', 'boʊt', 'We cross the river by boat.', 'beginner', 'noun', NOW(), NOW()),
      ('ship', 'tàu thủy', 'ʃɪp', 'The ship sails across the ocean.', 'beginner', 'noun', NOW(), NOW()),

      -- School Items
      ('pen', 'bút', 'pen', 'Write with a pen.', 'beginner', 'noun', NOW(), NOW()),
      ('pencil', 'bút chì', 'ˈpensəl', 'Draw with a pencil.', 'beginner', 'noun', NOW(), NOW()),
      ('paper', 'giấy', 'ˈpeɪpər', 'Write on the paper.', 'beginner', 'noun', NOW(), NOW()),
      ('notebook', 'vở', 'ˈnoʊtbʊk', 'Take notes in your notebook.', 'beginner', 'noun', NOW(), NOW()),
      ('bag', 'túi', 'bæɡ', 'Put your books in the bag.', 'beginner', 'noun', NOW(), NOW()),
      ('desk', 'bàn học', 'desk', 'Sit at your desk.', 'beginner', 'noun', NOW(), NOW()),
      ('blackboard', 'bảng đen', 'ˈblækbɔːrd', 'Write on the blackboard.', 'beginner', 'noun', NOW(), NOW()),
      ('teacher', 'giáo viên', 'ˈtiːtʃər', 'The teacher is kind.', 'beginner', 'noun', NOW(), NOW()),
      ('student', 'học sinh', 'ˈstuːdnt', 'I am a student.', 'beginner', 'noun', NOW(), NOW()),
      ('class', 'lớp học', 'klæs', 'My class has 30 students.', 'beginner', 'noun', NOW(), NOW()),
      ('lesson', 'bài học', 'ˈlesn', 'Today''s lesson is about animals.', 'beginner', 'noun', NOW(), NOW()),
      ('homework', 'bài tập về nhà', 'ˈhoʊmwɜːrk', 'Do your homework.', 'beginner', 'noun', NOW(), NOW()),
      ('exam', 'kỳ thi', 'ɪɡˈzæm', 'Study for the exam.', 'beginner', 'noun', NOW(), NOW()),

      -- Basic Adjectives
      ('new', 'mới', 'nuː', 'I have a new car.', 'beginner', 'adjective', NOW(), NOW()),
      ('old', 'cũ', 'oʊld', 'This is an old house.', 'beginner', 'adjective', NOW(), NOW()),
      ('young', 'trẻ', 'jʌŋ', 'She is young.', 'beginner', 'adjective', NOW(), NOW()),
      ('tall', 'cao', 'tɔːl', 'He is very tall.', 'beginner', 'adjective', NOW(), NOW()),
      ('short', 'thấp', 'ʃɔːrt', 'The child is short.', 'beginner', 'adjective', NOW(), NOW()),
      ('fat', 'béo', 'fæt', 'The cat is fat.', 'beginner', 'adjective', NOW(), NOW()),
      ('thin', 'gầy', 'θɪn', 'She is thin.', 'beginner', 'adjective', NOW(), NOW()),
      ('strong', 'mạnh', 'strɔːŋ', 'He is strong.', 'beginner', 'adjective', NOW(), NOW()),
      ('weak', 'yếu', 'wiːk', 'The old man is weak.', 'beginner', 'adjective', NOW(), NOW()),
      ('fast', 'nhanh', 'fæst', 'The car is fast.', 'beginner', 'adjective', NOW(), NOW()),
      ('slow', 'chậm', 'sloʊ', 'The turtle is slow.', 'beginner', 'adjective', NOW(), NOW()),
      ('clean', 'sạch', 'kliːn', 'Keep your room clean.', 'beginner', 'adjective', NOW(), NOW()),
      ('dirty', 'bẩn', 'ˈdɜːrti', 'Your hands are dirty.', 'beginner', 'adjective', NOW(), NOW()),
      ('beautiful', 'đẹp', 'ˈbjuːtɪfl', 'The flower is beautiful.', 'beginner', 'adjective', NOW(), NOW()),
      ('ugly', 'xấu', 'ˈʌɡli', 'The monster is ugly.', 'beginner', 'adjective', NOW(), NOW()),
      ('rich', 'giàu', 'rɪtʃ', 'He is rich.', 'beginner', 'adjective', NOW(), NOW()),
      ('poor', 'nghèo', 'pʊr', 'They are poor.', 'beginner', 'adjective', NOW(), NOW()),
      ('easy', 'dễ', 'ˈiːzi', 'This test is easy.', 'beginner', 'adjective', NOW(), NOW()),
      ('hard', 'khó', 'hɑːrd', 'Math is hard.', 'beginner', 'adjective', NOW(), NOW()),
      ('long', 'dài', 'lɔːŋ', 'The river is long.', 'beginner', 'adjective', NOW(), NOW()),

      -- Time
      ('time', 'thời gian', 'taɪm', 'What time is it?', 'beginner', 'noun', NOW(), NOW()),
      ('hour', 'giờ', 'aʊər', 'Wait one hour.', 'beginner', 'noun', NOW(), NOW()),
      ('minute', 'phút', 'ˈmɪnɪt', 'Five minutes left.', 'beginner', 'noun', NOW(), NOW()),
      ('second', 'giây', 'ˈsekənd', 'Wait a second.', 'beginner', 'noun', NOW(), NOW()),
      ('day', 'ngày', 'deɪ', 'Have a good day.', 'beginner', 'noun', NOW(), NOW()),
      ('week', 'tuần', 'wiːk', 'See you next week.', 'beginner', 'noun', NOW(), NOW()),
      ('month', 'tháng', 'mʌnθ', 'This month is busy.', 'beginner', 'noun', NOW(), NOW()),
      ('year', 'năm', 'jɪr', 'Happy new year!', 'beginner', 'noun', NOW(), NOW()),
      ('morning', 'buổi sáng', 'ˈmɔːrnɪŋ', 'Good morning!', 'beginner', 'noun', NOW(), NOW()),
      ('afternoon', 'buổi chiều', 'ˌæftərˈnuːn', 'Good afternoon!', 'beginner', 'noun', NOW(), NOW()),
      ('evening', 'buổi tối', 'ˈiːvnɪŋ', 'Good evening!', 'beginner', 'noun', NOW(), NOW()),
      ('night', 'đêm', 'naɪt', 'Good night!', 'beginner', 'noun', NOW(), NOW()),
      ('today', 'hôm nay', 'təˈdeɪ', 'Today is Monday.', 'beginner', 'adverb', NOW(), NOW()),
      ('tomorrow', 'ngày mai', 'təˈmɑːroʊ', 'See you tomorrow.', 'beginner', 'adverb', NOW(), NOW()),
      ('yesterday', 'hôm qua', 'ˈjestərdeɪ', 'I saw him yesterday.', 'beginner', 'adverb', NOW(), NOW()),
      ('now', 'bây giờ', 'naʊ', 'Do it now.', 'beginner', 'adverb', NOW(), NOW()),
      ('later', 'sau này', 'ˈleɪtər', 'Call me later.', 'beginner', 'adverb', NOW(), NOW()),
      ('early', 'sớm', 'ˈɜːrli', 'I wake up early.', 'beginner', 'adverb', NOW(), NOW()),
      ('late', 'muộn', 'leɪt', 'Don''t be late.', 'beginner', 'adverb', NOW(), NOW()),

      -- Fruits and Vegetables
      ('grape', 'nho', 'ɡreɪp', 'Grapes are sweet.', 'beginner', 'noun', NOW(), NOW()),
      ('strawberry', 'dâu tây', 'ˈstrɔːberi', 'Strawberries are red.', 'beginner', 'noun', NOW(), NOW()),
      ('watermelon', 'dưa hấu', 'ˈwɔːtərmelən', 'Watermelon is juicy.', 'beginner', 'noun', NOW(), NOW()),
      ('lemon', 'chanh', 'ˈlemən', 'Lemon is sour.', 'beginner', 'noun', NOW(), NOW()),
      ('tomato', 'cà chua', 'təˈmeɪtoʊ', 'Tomato is red.', 'beginner', 'noun', NOW(), NOW()),
      ('potato', 'khoai tây', 'pəˈteɪtoʊ', 'I like fried potatoes.', 'beginner', 'noun', NOW(), NOW()),
      ('carrot', 'cà rốt', 'ˈkærət', 'Rabbits eat carrots.', 'beginner', 'noun', NOW(), NOW()),
      ('onion', 'hành tây', 'ˈʌnjən', 'Onions make me cry.', 'beginner', 'noun', NOW(), NOW()),
      ('lettuce', 'xà lách', 'ˈletɪs', 'Lettuce is green.', 'beginner', 'noun', NOW(), NOW()),

      -- Basic Verbs (continued)
      ('come', 'đến', 'kʌm', 'Come here.', 'beginner', 'verb', NOW(), NOW()),
      ('go', 'đi', 'ɡoʊ', 'Let''s go.', 'beginner', 'verb', NOW(), NOW()),
      ('see', 'nhìn thấy', 'siː', 'I see you.', 'beginner', 'verb', NOW(), NOW()),
      ('look', 'nhìn', 'lʊk', 'Look at me.', 'beginner', 'verb', NOW(), NOW()),
      ('listen', 'nghe', 'ˈlɪsn', 'Listen to music.', 'beginner', 'verb', NOW(), NOW()),
      ('hear', 'nghe thấy', 'hɪr', 'I hear birds singing.', 'beginner', 'verb', NOW(), NOW()),
      ('touch', 'chạm', 'tʌtʃ', 'Don''t touch the fire.', 'beginner', 'verb', NOW(), NOW()),
      ('smell', 'ngửi', 'smel', 'Smell the flowers.', 'beginner', 'verb', NOW(), NOW()),
      ('taste', 'nếm', 'teɪst', 'Taste the soup.', 'beginner', 'verb', NOW(), NOW()),
      ('feel', 'cảm thấy', 'fiːl', 'I feel happy.', 'beginner', 'verb', NOW(), NOW()),
      ('think', 'nghĩ', 'θɪŋk', 'I think you''re right.', 'beginner', 'verb', NOW(), NOW()),
      ('know', 'biết', 'noʊ', 'I know the answer.', 'beginner', 'verb', NOW(), NOW()),
      ('learn', 'học', 'lɜːrn', 'Learn English.', 'beginner', 'verb', NOW(), NOW()),
      ('teach', 'dạy', 'tiːtʃ', 'Teachers teach students.', 'beginner', 'verb', NOW(), NOW()),
      ('help', 'giúp đỡ', 'help', 'Help me, please.', 'beginner', 'verb', NOW(), NOW()),
      ('give', 'đưa', 'ɡɪv', 'Give me the book.', 'beginner', 'verb', NOW(), NOW()),
      ('take', 'lấy', 'teɪk', 'Take this.', 'beginner', 'verb', NOW(), NOW()),
      ('put', 'đặt', 'pʊt', 'Put it on the table.', 'beginner', 'verb', NOW(), NOW()),
      ('get', 'lấy', 'ɡet', 'Get the ball.', 'beginner', 'verb', NOW(), NOW()),
      ('buy', 'mua', 'baɪ', 'Buy some bread.', 'beginner', 'verb', NOW(), NOW()),
      ('sell', 'bán', 'sel', 'They sell books.', 'beginner', 'verb', NOW(), NOW()),
      ('open', 'mở', 'ˈoʊpən', 'Open the door.', 'beginner', 'verb', NOW(), NOW()),
      ('close', 'đóng', 'kloʊz', 'Close the window.', 'beginner', 'verb', NOW(), NOW()),
      ('start', 'bắt đầu', 'stɑːrt', 'Start your work.', 'beginner', 'verb', NOW(), NOW()),
      ('stop', 'dừng lại', 'stɑːp', 'Stop talking.', 'beginner', 'verb', NOW(), NOW()),
      ('turn', 'quay', 'tɜːrn', 'Turn left.', 'beginner', 'verb', NOW(), NOW()),
      ('push', 'đẩy', 'pʊʃ', 'Push the door.', 'beginner', 'verb', NOW(), NOW()),
      ('pull', 'kéo', 'pʊl', 'Pull the rope.', 'beginner', 'verb', NOW(), NOW()),
      ('cut', 'cắt', 'kʌt', 'Cut the paper.', 'beginner', 'verb', NOW(), NOW()),
      ('cook', 'nấu ăn', 'kʊk', 'Cook dinner.', 'beginner', 'verb', NOW(), NOW()),
      ('wash', 'rửa', 'wɑːʃ', 'Wash your hands.', 'beginner', 'verb', NOW(), NOW())
      ON CONFLICT (word) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM vocabulary WHERE word IN ('table', 'chair', 'bed', 'door', 'window')`);
  }
}
