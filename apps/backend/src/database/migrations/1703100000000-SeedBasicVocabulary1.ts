import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedBasicVocabulary11703100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO vocabulary (word, meaning, pronunciation, example, level, "partOfSpeech", "createdAt", "updatedAt") VALUES
      -- Basic Colors
      ('red', 'màu đỏ', 'red', 'The apple is red.', 'beginner', 'adjective', NOW(), NOW()),
      ('blue', 'màu xanh dương', 'bluː', 'The sky is blue.', 'beginner', 'adjective', NOW(), NOW()),
      ('green', 'màu xanh lá', 'ɡriːn', 'The grass is green.', 'beginner', 'adjective', NOW(), NOW()),
      ('yellow', 'màu vàng', 'ˈjeloʊ', 'The sun is yellow.', 'beginner', 'adjective', NOW(), NOW()),
      ('black', 'màu đen', 'blæk', 'My cat is black.', 'beginner', 'adjective', NOW(), NOW()),
      ('white', 'màu trắng', 'waɪt', 'Snow is white.', 'beginner', 'adjective', NOW(), NOW()),
      ('orange', 'màu cam', 'ˈɔːrɪndʒ', 'The orange is orange.', 'beginner', 'adjective', NOW(), NOW()),
      ('purple', 'màu tím', 'ˈpɜːrpl', 'She likes purple flowers.', 'beginner', 'adjective', NOW(), NOW()),
      ('pink', 'màu hồng', 'pɪŋk', 'Her dress is pink.', 'beginner', 'adjective', NOW(), NOW()),
      ('brown', 'màu nâu', 'braʊn', 'The dog is brown.', 'beginner', 'adjective', NOW(), NOW()),

      -- Numbers
      ('one', 'một', 'wʌn', 'I have one book.', 'beginner', 'number', NOW(), NOW()),
      ('two', 'hai', 'tuː', 'There are two cats.', 'beginner', 'number', NOW(), NOW()),
      ('three', 'ba', 'θriː', 'I see three birds.', 'beginner', 'number', NOW(), NOW()),
      ('four', 'bốn', 'fɔːr', 'The table has four legs.', 'beginner', 'number', NOW(), NOW()),
      ('five', 'năm', 'faɪv', 'Give me five minutes.', 'beginner', 'number', NOW(), NOW()),
      ('six', 'sáu', 'sɪks', 'She is six years old.', 'beginner', 'number', NOW(), NOW()),
      ('seven', 'bảy', 'ˈsevn', 'There are seven days in a week.', 'beginner', 'number', NOW(), NOW()),
      ('eight', 'tám', 'eɪt', 'I wake up at eight o''clock.', 'beginner', 'number', NOW(), NOW()),
      ('nine', 'chín', 'naɪn', 'The baby is nine months old.', 'beginner', 'number', NOW(), NOW()),
      ('ten', 'mười', 'ten', 'I have ten fingers.', 'beginner', 'number', NOW(), NOW()),

      -- Body Parts
      ('head', 'đầu', 'hed', 'Put your hat on your head.', 'beginner', 'noun', NOW(), NOW()),
      ('face', 'mặt', 'feɪs', 'Wash your face.', 'beginner', 'noun', NOW(), NOW()),
      ('eye', 'mắt', 'aɪ', 'I have brown eyes.', 'beginner', 'noun', NOW(), NOW()),
      ('nose', 'mũi', 'noʊz', 'My nose is small.', 'beginner', 'noun', NOW(), NOW()),
      ('mouth', 'miệng', 'maʊθ', 'Open your mouth.', 'beginner', 'noun', NOW(), NOW()),
      ('ear', 'tai', 'ɪr', 'I can hear with my ears.', 'beginner', 'noun', NOW(), NOW()),
      ('hand', 'tay', 'hænd', 'Raise your hand.', 'beginner', 'noun', NOW(), NOW()),
      ('finger', 'ngón tay', 'ˈfɪŋɡər', 'I hurt my finger.', 'beginner', 'noun', NOW(), NOW()),
      ('foot', 'chân', 'fʊt', 'My foot hurts.', 'beginner', 'noun', NOW(), NOW()),
      ('leg', 'chân', 'leɡ', 'He broke his leg.', 'beginner', 'noun', NOW(), NOW()),

      -- Family Members
      ('mother', 'mẹ', 'ˈmʌðər', 'My mother is kind.', 'beginner', 'noun', NOW(), NOW()),
      ('father', 'cha', 'ˈfɑːðər', 'My father works hard.', 'beginner', 'noun', NOW(), NOW()),
      ('son', 'con trai', 'sʌn', 'He is my son.', 'beginner', 'noun', NOW(), NOW()),
      ('daughter', 'con gái', 'ˈdɔːtər', 'She is my daughter.', 'beginner', 'noun', NOW(), NOW()),
      ('brother', 'anh/em trai', 'ˈbrʌðər', 'My brother is tall.', 'beginner', 'noun', NOW(), NOW()),
      ('sister', 'chị/em gái', 'ˈsɪstər', 'My sister is smart.', 'beginner', 'noun', NOW(), NOW()),
      ('grandmother', 'bà', 'ˈɡrænmʌðər', 'My grandmother tells stories.', 'beginner', 'noun', NOW(), NOW()),
      ('grandfather', 'ông', 'ˈɡrænfɑːðər', 'My grandfather is wise.', 'beginner', 'noun', NOW(), NOW()),
      ('aunt', 'cô/dì', 'ænt', 'My aunt lives nearby.', 'beginner', 'noun', NOW(), NOW()),
      ('uncle', 'chú/bác', 'ˈʌŋkl', 'My uncle is funny.', 'beginner', 'noun', NOW(), NOW()),

      -- Animals
      ('cat', 'mèo', 'kæt', 'The cat is sleeping.', 'beginner', 'noun', NOW(), NOW()),
      ('dog', 'chó', 'dɔːɡ', 'The dog is barking.', 'beginner', 'noun', NOW(), NOW()),
      ('bird', 'chim', 'bɜːrd', 'The bird is singing.', 'beginner', 'noun', NOW(), NOW()),
      ('fish', 'cá', 'fɪʃ', 'Fish live in water.', 'beginner', 'noun', NOW(), NOW()),
      ('horse', 'ngựa', 'hɔːrs', 'The horse runs fast.', 'beginner', 'noun', NOW(), NOW()),
      ('cow', 'bò', 'kaʊ', 'The cow gives milk.', 'beginner', 'noun', NOW(), NOW()),
      ('pig', 'heo', 'pɪɡ', 'The pig is pink.', 'beginner', 'noun', NOW(), NOW()),
      ('chicken', 'gà', 'ˈtʃɪkɪn', 'The chicken lays eggs.', 'beginner', 'noun', NOW(), NOW()),
      ('duck', 'vịt', 'dʌk', 'The duck swims in the pond.', 'beginner', 'noun', NOW(), NOW()),
      ('rabbit', 'thỏ', 'ˈræbɪt', 'The rabbit hops quickly.', 'beginner', 'noun', NOW(), NOW()),

      -- Basic Verbs
      ('eat', 'ăn', 'iːt', 'I eat breakfast every morning.', 'beginner', 'verb', NOW(), NOW()),
      ('drink', 'uống', 'drɪŋk', 'Please drink more water.', 'beginner', 'verb', NOW(), NOW()),
      ('sleep', 'ngủ', 'sliːp', 'I sleep eight hours a night.', 'beginner', 'verb', NOW(), NOW()),
      ('walk', 'đi bộ', 'wɔːk', 'I walk to school.', 'beginner', 'verb', NOW(), NOW()),
      ('run', 'chạy', 'rʌn', 'Children run in the park.', 'beginner', 'verb', NOW(), NOW()),
      ('sit', 'ngồi', 'sɪt', 'Please sit down.', 'beginner', 'verb', NOW(), NOW()),
      ('stand', 'đứng', 'stænd', 'Stand up, please.', 'beginner', 'verb', NOW(), NOW()),
      ('read', 'đọc', 'riːd', 'I read books every day.', 'beginner', 'verb', NOW(), NOW()),
      ('write', 'viết', 'raɪt', 'Write your name here.', 'beginner', 'verb', NOW(), NOW()),
      ('speak', 'nói', 'spiːk', 'She speaks English well.', 'beginner', 'verb', NOW(), NOW()),

      -- Days of the Week
      ('Monday', 'thứ hai', 'ˈmʌndeɪ', 'I go to work on Monday.', 'beginner', 'noun', NOW(), NOW()),
      ('Tuesday', 'thứ ba', 'ˈtuːzdeɪ', 'Tuesday is a busy day.', 'beginner', 'noun', NOW(), NOW()),
      ('Wednesday', 'thứ tư', 'ˈwenzdeɪ', 'Wednesday is in the middle of the week.', 'beginner', 'noun', NOW(), NOW()),
      ('Thursday', 'thứ năm', 'ˈθɜːrzdeɪ', 'I have a meeting on Thursday.', 'beginner', 'noun', NOW(), NOW()),
      ('Friday', 'thứ sáu', 'ˈfraɪdeɪ', 'Friday is the last workday.', 'beginner', 'noun', NOW(), NOW()),
      ('Saturday', 'thứ bảy', 'ˈsætərdeɪ', 'I relax on Saturday.', 'beginner', 'noun', NOW(), NOW()),
      ('Sunday', 'chủ nhật', 'ˈsʌndeɪ', 'Sunday is a day of rest.', 'beginner', 'noun', NOW(), NOW()),

      -- Basic Food
      ('bread', 'bánh mì', 'bred', 'I eat bread for breakfast.', 'beginner', 'noun', NOW(), NOW()),
      ('rice', 'cơm', 'raɪs', 'Rice is a staple food.', 'beginner', 'noun', NOW(), NOW()),
      ('meat', 'thịt', 'miːt', 'He doesn''t eat meat.', 'beginner', 'noun', NOW(), NOW()),
      ('vegetable', 'rau', 'ˈvedʒtəbl', 'Eat more vegetables.', 'beginner', 'noun', NOW(), NOW()),
      ('fruit', 'trái cây', 'fruːt', 'Fruit is healthy.', 'beginner', 'noun', NOW(), NOW()),
      ('apple', 'táo', 'ˈæpl', 'An apple a day keeps the doctor away.', 'beginner', 'noun', NOW(), NOW()),
      ('banana', 'chuối', 'bəˈnænə', 'The monkey eats a banana.', 'beginner', 'noun', NOW(), NOW()),
      ('milk', 'sữa', 'mɪlk', 'Children drink milk.', 'beginner', 'noun', NOW(), NOW()),
      ('egg', 'trứng', 'eɡ', 'I cook eggs for breakfast.', 'beginner', 'noun', NOW(), NOW()),
      ('cheese', 'phô mai', 'tʃiːz', 'I like cheese on my sandwich.', 'beginner', 'noun', NOW(), NOW()),

      -- Clothing
      ('shirt', 'áo sơ mi', 'ʃɜːrt', 'He wears a white shirt.', 'beginner', 'noun', NOW(), NOW()),
      ('pants', 'quần dài', 'pænts', 'These pants are too long.', 'beginner', 'noun', NOW(), NOW()),
      ('dress', 'váy', 'dres', 'She wears a beautiful dress.', 'beginner', 'noun', NOW(), NOW()),
      ('shoes', 'giày', 'ʃuːz', 'My shoes are comfortable.', 'beginner', 'noun', NOW(), NOW()),
      ('hat', 'mũ', 'hæt', 'Wear a hat in the sun.', 'beginner', 'noun', NOW(), NOW()),
      ('coat', 'áo khoác', 'koʊt', 'It''s cold, wear your coat.', 'beginner', 'noun', NOW(), NOW()),

      -- Weather
      ('sun', 'mặt trời', 'sʌn', 'The sun is bright today.', 'beginner', 'noun', NOW(), NOW()),
      ('rain', 'mưa', 'reɪn', 'It will rain tomorrow.', 'beginner', 'noun', NOW(), NOW()),
      ('snow', 'tuyết', 'snoʊ', 'Children play in the snow.', 'beginner', 'noun', NOW(), NOW()),
      ('wind', 'gió', 'wɪnd', 'The wind is strong today.', 'beginner', 'noun', NOW(), NOW()),
      ('cloud', 'mây', 'klaʊd', 'There are clouds in the sky.', 'beginner', 'noun', NOW(), NOW()),
      ('hot', 'nóng', 'hɑːt', 'Today is very hot.', 'beginner', 'adjective', NOW(), NOW()),
      ('cold', 'lạnh', 'koʊld', 'Winter is cold.', 'beginner', 'adjective', NOW(), NOW()),
      ('warm', 'ấm', 'wɔːrm', 'Spring is warm.', 'beginner', 'adjective', NOW(), NOW()),
      ('cool', 'mát', 'kuːl', 'The evening is cool.', 'beginner', 'adjective', NOW(), NOW())
      ON CONFLICT (word) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM vocabulary WHERE level = 'beginner'`);
  }
}
