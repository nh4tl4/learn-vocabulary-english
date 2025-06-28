import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedBasicVocabulary41703400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO vocabulary (word, meaning, pronunciation, example, level, "partOfSpeech", "createdAt", "updatedAt") VALUES
      -- More Basic Verbs
      ('make', 'làm', 'meɪk', 'Make a cake.', 'beginner', 'verb', NOW(), NOW()),
      ('have', 'có', 'hæv', 'I have a car.', 'beginner', 'verb', NOW(), NOW()),
      ('be', 'là/ở', 'biː', 'I am happy.', 'beginner', 'verb', NOW(), NOW()),
      ('do', 'làm', 'duː', 'Do your homework.', 'beginner', 'verb', NOW(), NOW()),
      ('say', 'nói', 'seɪ', 'What did you say?', 'beginner', 'verb', NOW(), NOW()),
      ('tell', 'kể', 'tel', 'Tell me a story.', 'beginner', 'verb', NOW(), NOW()),
      ('ask', 'hỏi', 'æsk', 'Ask a question.', 'beginner', 'verb', NOW(), NOW()),
      ('answer', 'trả lời', 'ˈænsər', 'Answer the phone.', 'beginner', 'verb', NOW(), NOW()),
      ('call', 'gọi', 'kɔːl', 'Call your mother.', 'beginner', 'verb', NOW(), NOW()),
      ('meet', 'gặp', 'miːt', 'Nice to meet you.', 'beginner', 'verb', NOW(), NOW()),
      ('visit', 'thăm', 'ˈvɪzɪt', 'Visit your grandmother.', 'beginner', 'verb', NOW(), NOW()),
      ('stay', 'ở lại', 'steɪ', 'Stay here.', 'beginner', 'verb', NOW(), NOW()),
      ('leave', 'rời đi', 'liːv', 'Leave the room.', 'beginner', 'verb', NOW(), NOW()),
      ('arrive', 'đến', 'əˈraɪv', 'The train will arrive soon.', 'beginner', 'verb', NOW(), NOW()),
      ('return', 'trở về', 'rɪˈtɜːrn', 'Return home.', 'beginner', 'verb', NOW(), NOW()),
      ('bring', 'mang đến', 'brɪŋ', 'Bring your book.', 'beginner', 'verb', NOW(), NOW()),
      ('carry', 'mang', 'ˈkæri', 'Carry the bag.', 'beginner', 'verb', NOW(), NOW()),
      ('send', 'gửi', 'send', 'Send a letter.', 'beginner', 'verb', NOW(), NOW()),
      ('receive', 'nhận', 'rɪˈsiːv', 'Receive a gift.', 'beginner', 'verb', NOW(), NOW()),
      ('find', 'tìm thấy', 'faɪnd', 'Find your keys.', 'beginner', 'verb', NOW(), NOW()),
      ('lose', 'mất', 'luːz', 'Don''t lose your wallet.', 'beginner', 'verb', NOW(), NOW()),
      ('keep', 'giữ', 'kiːp', 'Keep the change.', 'beginner', 'verb', NOW(), NOW()),
      ('throw', 'ném', 'θroʊ', 'Throw the ball.', 'beginner', 'verb', NOW(), NOW()),
      ('catch', 'bắt', 'kætʃ', 'Catch the ball.', 'beginner', 'verb', NOW(), NOW()),
      ('hit', 'đánh', 'hɪt', 'Hit the ball.', 'beginner', 'verb', NOW(), NOW()),
      ('kick', 'đá', 'kɪk', 'Kick the ball.', 'beginner', 'verb', NOW(), NOW()),
      ('jump', 'nhảy', 'dʒʌmp', 'Jump high.', 'beginner', 'verb', NOW(), NOW()),
      ('climb', 'leo', 'klaɪm', 'Climb the tree.', 'beginner', 'verb', NOW(), NOW()),
      ('fall', 'rơi', 'fɔːl', 'Don''t fall down.', 'beginner', 'verb', NOW(), NOW()),
      ('fly', 'bay', 'flaɪ', 'Birds fly in the sky.', 'beginner', 'verb', NOW(), NOW()),
      ('swim', 'bơi', 'swɪm', 'I can swim.', 'beginner', 'verb', NOW(), NOW()),
      ('dance', 'nhảy múa', 'dæns', 'She loves to dance.', 'beginner', 'verb', NOW(), NOW()),
      ('sing', 'hát', 'sɪŋ', 'Sing a song.', 'beginner', 'verb', NOW(), NOW()),
      ('play', 'chơi', 'pleɪ', 'Play with friends.', 'beginner', 'verb', NOW(), NOW()),
      ('win', 'thắng', 'wɪn', 'Our team will win.', 'beginner', 'verb', NOW(), NOW()),
      ('lose', 'thua', 'luːz', 'Don''t lose the game.', 'beginner', 'verb', NOW(), NOW()),

      -- Sports and Games
      ('game', 'trò chơi', 'ɡeɪm', 'Let''s play a game.', 'beginner', 'noun', NOW(), NOW()),
      ('sport', 'thể thao', 'spɔːrt', 'I like sport.', 'beginner', 'noun', NOW(), NOW()),
      ('football', 'bóng đá', 'ˈfʊtbɔːl', 'Play football.', 'beginner', 'noun', NOW(), NOW()),
      ('basketball', 'bóng rổ', 'ˈbæskɪtbɔːl', 'He plays basketball.', 'beginner', 'noun', NOW(), NOW()),
      ('tennis', 'quần vợt', 'ˈtenɪs', 'Tennis is fun.', 'beginner', 'noun', NOW(), NOW()),
      ('volleyball', 'bóng chuyền', 'ˈvɑːlibɔːl', 'Girls play volleyball.', 'beginner', 'noun', NOW(), NOW()),
      ('baseball', 'bóng chày', 'ˈbeɪsbɔːl', 'Baseball is popular.', 'beginner', 'noun', NOW(), NOW()),
      ('swimming', 'bơi lội', 'ˈswɪmɪŋ', 'Swimming is good exercise.', 'beginner', 'noun', NOW(), NOW()),
      ('running', 'chạy bộ', 'ˈrʌnɪŋ', 'Running keeps you fit.', 'beginner', 'noun', NOW(), NOW()),
      ('cycling', 'đạp xe', 'ˈsaɪklɪŋ', 'Cycling is eco-friendly.', 'beginner', 'noun', NOW(), NOW()),

      -- Music and Entertainment
      ('music', 'âm nhạc', 'ˈmjuːzɪk', 'I love music.', 'beginner', 'noun', NOW(), NOW()),
      ('song', 'bài hát', 'sɔːŋ', 'Sing a song.', 'beginner', 'noun', NOW(), NOW()),
      ('movie', 'phim', 'ˈmuːvi', 'Watch a movie.', 'beginner', 'noun', NOW(), NOW()),
      ('show', 'chương trình', 'ʃoʊ', 'The show is funny.', 'beginner', 'noun', NOW(), NOW()),
      ('party', 'tiệc', 'ˈpɑːrti', 'Come to my party.', 'beginner', 'noun', NOW(), NOW()),
      ('dance', 'điệu nhảy', 'dæns', 'Learn a new dance.', 'beginner', 'noun', NOW(), NOW()),
      ('guitar', 'ghi ta', 'ɡɪˈtɑːr', 'Play the guitar.', 'beginner', 'noun', NOW(), NOW()),
      ('piano', 'đàn piano', 'piˈænoʊ', 'She plays piano.', 'beginner', 'noun', NOW(), NOW()),
      ('drum', 'trống', 'drʌm', 'Beat the drum.', 'beginner', 'noun', NOW(), NOW()),

      -- Technology
      ('internet', 'internet', 'ˈɪntərnet', 'Use the internet.', 'beginner', 'noun', NOW(), NOW()),
      ('email', 'thư điện tử', 'ˈiːmeɪl', 'Send an email.', 'beginner', 'noun', NOW(), NOW()),
      ('website', 'trang web', 'ˈwebsaɪt', 'Visit the website.', 'beginner', 'noun', NOW(), NOW()),
      ('camera', 'máy ảnh', 'ˈkæmərə', 'Take a photo with the camera.', 'beginner', 'noun', NOW(), NOW()),
      ('photo', 'ảnh', 'ˈfoʊtoʊ', 'Look at the photo.', 'beginner', 'noun', NOW(), NOW()),
      ('video', 'video', 'ˈvɪdioʊ', 'Watch a video.', 'beginner', 'noun', NOW(), NOW()),

      -- Shopping and Money
      ('money', 'tiền', 'ˈmʌni', 'I need money.', 'beginner', 'noun', NOW(), NOW()),
      ('price', 'giá', 'praɪs', 'What''s the price?', 'beginner', 'noun', NOW(), NOW()),
      ('cheap', 'rẻ', 'tʃiːp', 'This is cheap.', 'beginner', 'adjective', NOW(), NOW()),
      ('expensive', 'đắt', 'ɪkˈspensɪv', 'That car is expensive.', 'beginner', 'adjective', NOW(), NOW()),
      ('pay', 'trả tiền', 'peɪ', 'Pay the bill.', 'beginner', 'verb', NOW(), NOW()),
      ('cost', 'có giá', 'kɔːst', 'How much does it cost?', 'beginner', 'verb', NOW(), NOW()),
      ('shop', 'mua sắm', 'ʃɑːp', 'Let''s go shop.', 'beginner', 'verb', NOW(), NOW()),
      ('customer', 'khách hàng', 'ˈkʌstəmər', 'The customer is happy.', 'beginner', 'noun', NOW(), NOW()),
      ('cashier', 'thu ngân', 'kæˈʃɪr', 'Pay the cashier.', 'beginner', 'noun', NOW(), NOW()),

      -- Feelings and Emotions
      ('love', 'yêu', 'lʌv', 'I love my family.', 'beginner', 'verb', NOW(), NOW()),
      ('like', 'thích', 'laɪk', 'I like ice cream.', 'beginner', 'verb', NOW(), NOW()),
      ('hate', 'ghét', 'heɪt', 'I hate spiders.', 'beginner', 'verb', NOW(), NOW()),
      ('want', 'muốn', 'wɑːnt', 'I want water.', 'beginner', 'verb', NOW(), NOW()),
      ('need', 'cần', 'niːd', 'I need help.', 'beginner', 'verb', NOW(), NOW()),
      ('hope', 'hy vọng', 'hoʊp', 'I hope you''re well.', 'beginner', 'verb', NOW(), NOW()),
      ('wish', 'ước', 'wɪʃ', 'Make a wish.', 'beginner', 'verb', NOW(), NOW()),
      ('fear', 'sợ', 'fɪr', 'Don''t fear the dark.', 'beginner', 'verb', NOW(), NOW()),
      ('worry', 'lo lắng', 'ˈwɜːri', 'Don''t worry.', 'beginner', 'verb', NOW(), NOW()),
      ('smile', 'cười', 'smaɪl', 'Please smile.', 'beginner', 'verb', NOW(), NOW()),
      ('laugh', 'cười to', 'læf', 'The joke makes me laugh.', 'beginner', 'verb', NOW(), NOW()),
      ('cry', 'khóc', 'kraɪ', 'Babies cry when hungry.', 'beginner', 'verb', NOW(), NOW()),
      ('angry', 'tức giận', 'ˈæŋɡri', 'Don''t be angry.', 'beginner', 'adjective', NOW(), NOW()),
      ('afraid', 'sợ hãi', 'əˈfreɪd', 'I''m afraid of snakes.', 'beginner', 'adjective', NOW(), NOW()),
      ('surprised', 'ngạc nhiên', 'sərˈpraɪzd', 'I was surprised.', 'beginner', 'adjective', NOW(), NOW()),

      -- More Food Items
      ('soup', 'súp', 'suːp', 'Chicken soup is delicious.', 'beginner', 'noun', NOW(), NOW()),
      ('sandwich', 'bánh sandwich', 'ˈsænwɪtʃ', 'Make a sandwich.', 'beginner', 'noun', NOW(), NOW()),
      ('pizza', 'pizza', 'ˈpiːtsə', 'Order pizza for dinner.', 'beginner', 'noun', NOW(), NOW()),
      ('hamburger', 'hamburger', 'ˈhæmbɜːrɡər', 'Eat a hamburger.', 'beginner', 'noun', NOW(), NOW()),
      ('noodle', 'mì', 'ˈnuːdl', 'Slurp the noodles.', 'beginner', 'noun', NOW(), NOW()),
      ('salad', 'sa lát', 'ˈsæləd', 'Eat a healthy salad.', 'beginner', 'noun', NOW(), NOW()),
      ('cake', 'bánh ngọt', 'keɪk', 'Birthday cake is sweet.', 'beginner', 'noun', NOW(), NOW()),
      ('cookie', 'bánh quy', 'ˈkʊki', 'Chocolate cookies are tasty.', 'beginner', 'noun', NOW(), NOW()),
      ('candy', 'kẹo', 'ˈkændi', 'Children love candy.', 'beginner', 'noun', NOW(), NOW()),
      ('chocolate', 'sô cô la', 'ˈtʃɔːklət', 'Dark chocolate is healthy.', 'beginner', 'noun', NOW(), NOW()),
      ('ice cream', 'kem', 'aɪs kriːm', 'Ice cream is cold.', 'beginner', 'noun', NOW(), NOW()),
      ('juice', 'nước ép', 'dʒuːs', 'Orange juice is vitamin C.', 'beginner', 'noun', NOW(), NOW()),
      ('coffee', 'cà phê', 'ˈkɔːfi', 'Drink coffee in the morning.', 'beginner', 'noun', NOW(), NOW()),
      ('tea', 'trà', 'tiː', 'Green tea is healthy.', 'beginner', 'noun', NOW(), NOW()),
      ('soda', 'nước ngọt', 'ˈsoʊdə', 'Soda has sugar.', 'beginner', 'noun', NOW(), NOW()),

      -- Common Phrases and Expressions
      ('excuse me', 'xin lỗi (để xin phép)', 'ɪkˈskjuːs miː', 'Excuse me, where is the bathroom?', 'beginner', 'phrase', NOW(), NOW()),
      ('sorry', 'xin lỗi', 'ˈsɑːri', 'Sorry, I''m late.', 'beginner', 'exclamation', NOW(), NOW()),
      ('welcome', 'chào mừng', 'ˈwelkəm', 'Welcome to our school.', 'beginner', 'exclamation', NOW(), NOW()),
      ('congratulations', 'chúc mừng', 'kənˌɡrætʃəˈleɪʃnz', 'Congratulations on your success!', 'beginner', 'exclamation', NOW(), NOW()),
      ('good luck', 'chúc may mắn', 'ɡʊd lʌk', 'Good luck on your exam!', 'beginner', 'phrase', NOW(), NOW()),
      ('have fun', 'chúc vui vẻ', 'hæv fʌn', 'Have fun at the party!', 'beginner', 'phrase', NOW(), NOW()),
      ('take care', 'bảo trọng', 'teɪk ker', 'Take care of yourself.', 'beginner', 'phrase', NOW(), NOW()),
      ('see you later', 'hẹn gặp lại', 'siː juː ˈleɪtər', 'See you later!', 'beginner', 'phrase', NOW(), NOW()),
      ('how are you', 'bạn khỏe không', 'haʊ ɑːr juː', 'How are you today?', 'beginner', 'phrase', NOW(), NOW()),
      ('what''s up', 'có gì mới không', 'wʌts ʌp', 'Hey, what''s up?', 'beginner', 'phrase', NOW(), NOW())
      ON CONFLICT (word) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM vocabulary WHERE word IN ('make', 'have', 'be', 'do', 'say')`);
  }
}
