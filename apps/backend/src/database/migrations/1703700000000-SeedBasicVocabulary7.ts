import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedBasicVocabulary71703700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO vocabulary (word, meaning, pronunciation, example, level, "partOfSpeech", "createdAt", "updatedAt") VALUES
      -- More Fruits
      ('pineapple', 'dứa', 'ˈpaɪnæpl', 'Pineapple is sweet and sour.', 'beginner', 'noun', NOW(), NOW()),
      ('mango', 'xoài', 'ˈmæŋɡoʊ', 'Mango is tropical fruit.', 'beginner', 'noun', NOW(), NOW()),
      ('papaya', 'đu đủ', 'pəˈpaɪə', 'Papaya is good for health.', 'beginner', 'noun', NOW(), NOW()),
      ('coconut', 'dừa', 'ˈkoʊkənʌt', 'Drink coconut water.', 'beginner', 'noun', NOW(), NOW()),
      ('peach', 'đào', 'piːtʃ', 'Peach is soft and sweet.', 'beginner', 'noun', NOW(), NOW()),
      ('pear', 'lê', 'per', 'Pear is green or yellow.', 'beginner', 'noun', NOW(), NOW()),
      ('cherry', 'anh đào', 'ˈtʃeri', 'Cherry is small and red.', 'beginner', 'noun', NOW(), NOW()),
      ('plum', 'mận', 'plʌm', 'Plum is purple fruit.', 'beginner', 'noun', NOW(), NOW()),
      ('kiwi', 'kiwi', 'ˈkiːwi', 'Kiwi is green inside.', 'beginner', 'noun', NOW(), NOW()),
      ('avocado', 'bơ', 'ˌævəˈkɑːdoʊ', 'Avocado is healthy fat.', 'beginner', 'noun', NOW(), NOW()),

      -- More Vegetables
      ('broccoli', 'súp lơ xanh', 'ˈbrɑːkəli', 'Broccoli is green vegetable.', 'beginner', 'noun', NOW(), NOW()),
      ('cauliflower', 'súp lơ trắng', 'ˈkɔːliflaʊər', 'Cauliflower is white.', 'beginner', 'noun', NOW(), NOW()),
      ('spinach', 'rau bina', 'ˈspɪnɪtʃ', 'Spinach is rich in iron.', 'beginner', 'noun', NOW(), NOW()),
      ('cabbage', 'bắp cải', 'ˈkæbɪdʒ', 'Cabbage makes good salad.', 'beginner', 'noun', NOW(), NOW()),
      ('corn', 'ngô', 'kɔːrn', 'Corn is yellow vegetable.', 'beginner', 'noun', NOW(), NOW()),
      ('peas', 'đậu Hà Lan', 'piːz', 'Green peas are small.', 'beginner', 'noun', NOW(), NOW()),
      ('beans', 'đậu', 'biːnz', 'Beans have protein.', 'beginner', 'noun', NOW(), NOW()),
      ('cucumber', 'dưa chuột', 'ˈkjuːkʌmbər', 'Cucumber is cool and fresh.', 'beginner', 'noun', NOW(), NOW()),
      ('eggplant', 'cà tím', 'ˈeɡplænt', 'Eggplant is purple vegetable.', 'beginner', 'noun', NOW(), NOW()),
      ('pepper', 'ớt chuông', 'ˈpepər', 'Red pepper is sweet.', 'beginner', 'noun', NOW(), NOW()),

      -- Hobbies and Activities
      ('hobby', 'sở thích', 'ˈhɑːbi', 'Reading is my hobby.', 'beginner', 'noun', NOW(), NOW()),
      ('reading', 'đọc sách', 'ˈriːdɪŋ', 'I enjoy reading books.', 'beginner', 'noun', NOW(), NOW()),
      ('writing', 'viết', 'ˈraɪtɪŋ', 'Writing helps express ideas.', 'beginner', 'noun', NOW(), NOW()),
      ('drawing', 'vẽ', 'ˈdrɔːɪŋ', 'Drawing is creative hobby.', 'beginner', 'noun', NOW(), NOW()),
      ('painting', 'vẽ tranh', 'ˈpeɪntɪŋ', 'Oil painting is beautiful.', 'beginner', 'noun', NOW(), NOW()),
      ('singing', 'hát', 'ˈsɪŋɪŋ', 'Singing makes me happy.', 'beginner', 'noun', NOW(), NOW()),
      ('dancing', 'nhảy múa', 'ˈdænsɪŋ', 'Dancing is good exercise.', 'beginner', 'noun', NOW(), NOW()),
      ('cooking', 'nấu ăn', 'ˈkʊkɪŋ', 'Cooking is useful skill.', 'beginner', 'noun', NOW(), NOW()),
      ('gardening', 'làm vườn', 'ˈɡɑːrdnɪŋ', 'Gardening is relaxing.', 'beginner', 'noun', NOW(), NOW()),
      ('fishing', 'câu cá', 'ˈfɪʃɪŋ', 'Fishing requires patience.', 'beginner', 'noun', NOW(), NOW()),
      ('hiking', 'đi bộ đường dài', 'ˈhaɪkɪŋ', 'Hiking in mountains is fun.', 'beginner', 'noun', NOW(), NOW()),
      ('camping', 'cắm trại', 'ˈkæmpɪŋ', 'Camping under stars.', 'beginner', 'noun', NOW(), NOW()),
      ('photography', 'chụp ảnh', 'fəˈtɑːɡrəfi', 'Photography captures moments.', 'beginner', 'noun', NOW(), NOW()),
      ('collecting', 'sưu tập', 'kəˈlektɪŋ', 'Collecting stamps is hobby.', 'beginner', 'noun', NOW(), NOW()),

      -- More Animals (Wild)
      ('giraffe', 'hươu cao cổ', 'dʒəˈræf', 'Giraffe has long neck.', 'beginner', 'noun', NOW(), NOW()),
      ('zebra', 'ngựa vằn', 'ˈziːbrə', 'Zebra has black stripes.', 'beginner', 'noun', NOW(), NOW()),
      ('kangaroo', 'chuột túi', 'ˌkæŋɡəˈruː', 'Kangaroo jumps high.', 'beginner', 'noun', NOW(), NOW()),
      ('panda', 'gấu trúc', 'ˈpændə', 'Panda eats bamboo.', 'beginner', 'noun', NOW(), NOW()),
      ('penguin', 'chim cánh cụt', 'ˈpeŋɡwən', 'Penguin lives in cold.', 'beginner', 'noun', NOW(), NOW()),
      ('dolphin', 'cá heo', 'ˈdɑːlfən', 'Dolphin is smart animal.', 'beginner', 'noun', NOW(), NOW()),
      ('whale', 'cá voi', 'weɪl', 'Whale is biggest animal.', 'beginner', 'noun', NOW(), NOW()),
      ('shark', 'cá mập', 'ʃɑːrk', 'Shark lives in ocean.', 'beginner', 'noun', NOW(), NOW()),
      ('octopus', 'bạch tuộc', 'ˈɑːktəpəs', 'Octopus has eight arms.', 'beginner', 'noun', NOW(), NOW()),
      ('jellyfish', 'sứa', 'ˈdʒelifɪʃ', 'Jellyfish can sting.', 'beginner', 'noun', NOW(), NOW()),

      -- Insects and Small Animals
      ('ant', 'kiến', 'ænt', 'Ant works very hard.', 'beginner', 'noun', NOW(), NOW()),
      ('fly', 'ruồi', 'flaɪ', 'Fly is annoying insect.', 'beginner', 'noun', NOW(), NOW()),
      ('mosquito', 'muỗi', 'məˈskiːtoʊ', 'Mosquito bites itch.', 'beginner', 'noun', NOW(), NOW()),
      ('cockroach', 'gián', 'ˈkɑːkroʊtʃ', 'Cockroach is dirty insect.', 'beginner', 'noun', NOW(), NOW()),
      ('worm', 'sâu', 'wɜːrm', 'Bird eats worm.', 'beginner', 'noun', NOW(), NOW()),
      ('snail', 'ốc sên', 'sneɪl', 'Snail moves slowly.', 'beginner', 'noun', NOW(), NOW()),
      ('frog', 'ếch', 'frɔːɡ', 'Frog jumps and swims.', 'beginner', 'noun', NOW(), NOW()),
      ('turtle', 'rùa', 'ˈtɜːrtl', 'Turtle has hard shell.', 'beginner', 'noun', NOW(), NOW()),
      ('lizard', 'thằn lằn', 'ˈlɪzərd', 'Lizard sunbathes on rock.', 'beginner', 'noun', NOW(), NOW()),

      -- More Household Items
      ('trash can', 'thùng rác', 'træʃ kæn', 'Put garbage in trash can.', 'beginner', 'noun', NOW(), NOW()),
      ('broom', 'chổi', 'bruːm', 'Sweep with broom.', 'beginner', 'noun', NOW(), NOW()),
      ('dustpan', 'chổi xúc rác', 'ˈdʌstpæn', 'Use dustpan with broom.', 'beginner', 'noun', NOW(), NOW()),
      ('bucket', 'xô', 'ˈbʌkət', 'Fill bucket with water.', 'beginner', 'noun', NOW(), NOW()),
      ('mop', 'cây lau nhà', 'mɑːp', 'Clean floor with mop.', 'beginner', 'noun', NOW(), NOW()),
      ('sponge', 'miếng bọt biển', 'spʌndʒ', 'Wash dishes with sponge.', 'beginner', 'noun', NOW(), NOW()),
      ('detergent', 'chất tẩy rửa', 'dɪˈtɜːrdʒənt', 'Use detergent for washing.', 'beginner', 'noun', NOW(), NOW()),
      ('bleach', 'thuốc tẩy', 'bliːtʃ', 'Bleach makes things white.', 'beginner', 'noun', NOW(), NOW()),
      ('disinfectant', 'thuốc khử trùng', 'ˌdɪsɪnˈfektənt', 'Clean with disinfectant.', 'beginner', 'noun', NOW(), NOW()),

      -- Money and Shopping
      ('dollar', 'đô la', 'ˈdɑːlər', 'This costs five dollars.', 'beginner', 'noun', NOW(), NOW()),
      ('cent', 'xu', 'sent', 'One dollar has 100 cents.', 'beginner', 'noun', NOW(), NOW()),
      ('coin', 'đồng xu', 'kɔɪn', 'Put coin in machine.', 'beginner', 'noun', NOW(), NOW()),
      ('bill', 'tờ tiền', 'bɪl', 'Twenty dollar bill.', 'beginner', 'noun', NOW(), NOW()),
      ('cash', 'tiền mặt', 'kæʃ', 'Pay with cash.', 'beginner', 'noun', NOW(), NOW()),
      ('credit card', 'thẻ tín dụng', 'ˈkredət kɑːrd', 'Use credit card to pay.', 'beginner', 'noun', NOW(), NOW()),
      ('receipt', 'biên lai', 'rɪˈsiːt', 'Keep your receipt.', 'beginner', 'noun', NOW(), NOW()),
      ('change', 'tiền thối', 'tʃeɪndʒ', 'Here is your change.', 'beginner', 'noun', NOW(), NOW()),
      ('discount', 'giảm giá', 'ˈdɪskaʊnt', 'Get 20% discount.', 'beginner', 'noun', NOW(), NOW()),
      ('sale', 'khuyến mãi', 'seɪl', 'Everything on sale today.', 'beginner', 'noun', NOW(), NOW()),
      ('bargain', 'món hời', 'ˈbɑːrɡən', 'This is a good bargain.', 'beginner', 'noun', NOW(), NOW()),

      -- More Actions/Verbs
      ('build', 'xây dựng', 'bɪld', 'Build a house.', 'beginner', 'verb', NOW(), NOW()),
      ('break', 'làm vỡ', 'breɪk', 'Don''t break the glass.', 'beginner', 'verb', NOW(), NOW()),
      ('fix', 'sửa chữa', 'fɪks', 'Fix the broken chair.', 'beginner', 'verb', NOW(), NOW()),
      ('repair', 'sửa chữa', 'rɪˈper', 'Repair the car.', 'beginner', 'verb', NOW(), NOW()),
      ('destroy', 'phá hủy', 'dɪˈstrɔɪ', 'Fire can destroy forest.', 'beginner', 'verb', NOW(), NOW()),
      ('create', 'tạo ra', 'kriˈeɪt', 'Create beautiful art.', 'beginner', 'verb', NOW(), NOW()),
      ('invent', 'phát minh', 'ɪnˈvent', 'Edison invented light bulb.', 'beginner', 'verb', NOW(), NOW()),
      ('discover', 'khám phá', 'dɪˈskʌvər', 'Columbus discovered America.', 'beginner', 'verb', NOW(), NOW()),
      ('explore', 'khám phá', 'ɪkˈsplɔːr', 'Explore new places.', 'beginner', 'verb', NOW(), NOW()),
      ('travel', 'du lịch', 'ˈtrævl', 'Travel around world.', 'beginner', 'verb', NOW(), NOW()),
      ('move', 'di chuyển', 'muːv', 'Move to new city.', 'beginner', 'verb', NOW(), NOW()),
      ('change', 'thay đổi', 'tʃeɪndʒ', 'Change your habits.', 'beginner', 'verb', NOW(), NOW()),
      ('grow', 'phát triển', 'ɡroʊ', 'Children grow quickly.', 'beginner', 'verb', NOW(), NOW()),
      ('become', 'trở thành', 'bɪˈkʌm', 'Become a doctor.', 'beginner', 'verb', NOW(), NOW()),
      ('remain', 'ở lại', 'rɪˈmeɪn', 'Remain calm.', 'beginner', 'verb', NOW(), NOW()),
      ('continue', 'tiếp tục', 'kənˈtɪnjuː', 'Continue your work.', 'beginner', 'verb', NOW(), NOW()),
      ('finish', 'hoàn thành', 'ˈfɪnɪʃ', 'Finish your homework.', 'beginner', 'verb', NOW(), NOW()),
      ('complete', 'hoàn thành', 'kəmˈpliːt', 'Complete the project.', 'beginner', 'verb', NOW(), NOW()),
      ('begin', 'bắt đầu', 'bɪˈɡɪn', 'Begin the lesson.', 'beginner', 'verb', NOW(), NOW()),
      ('end', 'kết thúc', 'end', 'End the meeting.', 'beginner', 'verb', NOW(), NOW()),

      -- Weather Phenomena
      ('rainbow', 'cầu vồng', 'ˈreɪnboʊ', 'Rainbow after rain.', 'beginner', 'noun', NOW(), NOW()),
      ('lightning', 'tia chớp', 'ˈlaɪtnɪŋ', 'Lightning is dangerous.', 'beginner', 'noun', NOW(), NOW()),
      ('thunder', 'sấm', 'ˈθʌndər', 'Thunder is loud noise.', 'beginner', 'noun', NOW(), NOW()),
      ('storm', 'bão', 'stɔːrm', 'Stay inside during storm.', 'beginner', 'noun', NOW(), NOW()),
      ('hurricane', 'bão lớn', 'ˈhɜːrəkən', 'Hurricane destroys houses.', 'beginner', 'noun', NOW(), NOW()),
      ('tornado', 'lốc xoáy', 'tɔːrˈneɪdoʊ', 'Tornado spins very fast.', 'beginner', 'noun', NOW(), NOW()),
      ('earthquake', 'động đất', 'ˈɜːrθkweɪk', 'Earthquake shakes ground.', 'beginner', 'noun', NOW(), NOW()),
      ('flood', 'lũ lụt', 'flʌd', 'Heavy rain causes flood.', 'beginner', 'noun', NOW(), NOW()),
      ('drought', 'hạn hán', 'draʊt', 'No rain causes drought.', 'beginner', 'noun', NOW(), NOW()),
      ('avalanche', 'tuyết lở', 'ˈævəlæntʃ', 'Avalanche in mountains.', 'beginner', 'noun', NOW(), NOW()),

      -- Basic Geography
      ('continent', 'lục địa', 'ˈkɑːntənənt', 'Seven continents on Earth.', 'beginner', 'noun', NOW(), NOW()),
      ('country', 'đất nước', 'ˈkʌntri', 'America is big country.', 'beginner', 'noun', NOW(), NOW()),
      ('state', 'bang', 'steɪt', 'California is a state.', 'beginner', 'noun', NOW(), NOW()),
      ('province', 'tỉnh', 'ˈprɑːvəns', 'Quebec is Canadian province.', 'beginner', 'noun', NOW(), NOW()),
      ('capital', 'thủ đô', 'ˈkæpətl', 'Paris is capital of France.', 'beginner', 'noun', NOW(), NOW()),
      ('island', 'hòn đảo', 'ˈaɪlənd', 'Hawaii is beautiful island.', 'beginner', 'noun', NOW(), NOW()),
      ('peninsula', 'bán đảo', 'pəˈnɪnsələ', 'Italy is a peninsula.', 'beginner', 'noun', NOW(), NOW()),
      ('desert', 'sa mạc', 'ˈdezərt', 'Sahara is big desert.', 'beginner', 'noun', NOW(), NOW()),
      ('valley', 'thung lũng', 'ˈvæli', 'Beautiful valley between mountains.', 'beginner', 'noun', NOW(), NOW()),
      ('hill', 'đồi', 'hɪl', 'Walk up the hill.', 'beginner', 'noun', NOW(), NOW()),
      ('cliff', 'vách đá', 'klɪf', 'Don''t fall off cliff.', 'beginner', 'noun', NOW(), NOW()),
      ('cave', 'hang động', 'keɪv', 'Explore the dark cave.', 'beginner', 'noun', NOW(), NOW()),
      ('waterfall', 'thác nước', 'ˈwɔːtərfɔːl', 'Niagara is famous waterfall.', 'beginner', 'noun', NOW(), NOW()),
      ('volcano', 'núi lửa', 'vɑːlˈkeɪnoʊ', 'Active volcano is dangerous.', 'beginner', 'noun', NOW(), NOW())
      ON CONFLICT (word) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM vocabulary WHERE word IN ('pineapple', 'mango', 'papaya', 'coconut', 'peach')`);
  }
}
