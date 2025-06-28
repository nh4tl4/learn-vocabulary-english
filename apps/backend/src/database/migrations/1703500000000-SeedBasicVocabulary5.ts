import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedBasicVocabulary51703500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO vocabulary (word, meaning, pronunciation, example, level, "partOfSpeech", "createdAt", "updatedAt") VALUES
      -- More Numbers
      ('eleven', 'mười một', 'ɪˈlevən', 'I have eleven books.', 'beginner', 'number', NOW(), NOW()),
      ('twelve', 'mười hai', 'twelv', 'It''s twelve o''clock.', 'beginner', 'number', NOW(), NOW()),
      ('thirteen', 'mười ba', 'θɜːrˈtiːn', 'She is thirteen years old.', 'beginner', 'number', NOW(), NOW()),
      ('fourteen', 'mười bốn', 'fɔːrˈtiːn', 'Fourteen students are here.', 'beginner', 'number', NOW(), NOW()),
      ('fifteen', 'mười lăm', 'fɪfˈtiːn', 'Wait fifteen minutes.', 'beginner', 'number', NOW(), NOW()),
      ('sixteen', 'mười sáu', 'sɪksˈtiːn', 'She is sixteen years old.', 'beginner', 'number', NOW(), NOW()),
      ('seventeen', 'mười bảy', 'sevənˈtiːn', 'Seventeen people came.', 'beginner', 'number', NOW(), NOW()),
      ('eighteen', 'mười tám', 'eɪˈtiːn', 'I''m eighteen years old.', 'beginner', 'number', NOW(), NOW()),
      ('nineteen', 'mười chín', 'naɪnˈtiːn', 'Nineteen dollars, please.', 'beginner', 'number', NOW(), NOW()),
      ('twenty', 'hai mười', 'ˈtwenti', 'Twenty students in class.', 'beginner', 'number', NOW(), NOW()),
      ('thirty', 'ba mười', 'ˈθɜːrti', 'I''m thirty years old.', 'beginner', 'number', NOW(), NOW()),
      ('forty', 'bốn mười', 'ˈfɔːrti', 'Forty minutes left.', 'beginner', 'number', NOW(), NOW()),
      ('fifty', 'năm mười', 'ˈfɪfti', 'Fifty dollars is expensive.', 'beginner', 'number', NOW(), NOW()),
      ('sixty', 'sáu mười', 'ˈsɪksti', 'Sixty seconds in a minute.', 'beginner', 'number', NOW(), NOW()),
      ('seventy', 'bảy mười', 'ˈsevənti', 'My grandfather is seventy.', 'beginner', 'number', NOW(), NOW()),
      ('eighty', 'tám mười', 'ˈeɪti', 'Eighty pages to read.', 'beginner', 'number', NOW(), NOW()),
      ('ninety', 'chín mười', 'ˈnaɪnti', 'Ninety percent correct.', 'beginner', 'number', NOW(), NOW()),
      ('hundred', 'một trăm', 'ˈhʌndrəd', 'One hundred students.', 'beginner', 'number', NOW(), NOW()),
      ('thousand', 'một nghìn', 'ˈθaʊzənd', 'One thousand dollars.', 'beginner', 'number', NOW(), NOW()),

      -- Health and Medical
      ('health', 'sức khỏe', 'helθ', 'Health is important.', 'beginner', 'noun', NOW(), NOW()),
      ('medicine', 'thuốc', 'ˈmedəsən', 'Take your medicine.', 'beginner', 'noun', NOW(), NOW()),
      ('pain', 'đau', 'peɪn', 'I have pain in my back.', 'beginner', 'noun', NOW(), NOW()),
      ('hurt', 'đau', 'hɜːrt', 'My head hurts.', 'beginner', 'verb', NOW(), NOW()),
      ('fever', 'sốt', 'ˈfiːvər', 'I have a fever.', 'beginner', 'noun', NOW(), NOW()),
      ('cold', 'cảm lạnh', 'koʊld', 'I caught a cold.', 'beginner', 'noun', NOW(), NOW()),
      ('cough', 'ho', 'kɔːf', 'Cover your mouth when you cough.', 'beginner', 'verb', NOW(), NOW()),
      ('sneeze', 'hắt hơi', 'sniːz', 'Bless you when you sneeze.', 'beginner', 'verb', NOW(), NOW()),
      ('headache', 'đau đầu', 'ˈhedeɪk', 'I have a headache.', 'beginner', 'noun', NOW(), NOW()),
      ('toothache', 'đau răng', 'ˈtuːθeɪk', 'Go to dentist for toothache.', 'beginner', 'noun', NOW(), NOW()),
      ('stomachache', 'đau bụng', 'ˈstʌməkeɪk', 'Stomachache after eating.', 'beginner', 'noun', NOW(), NOW()),

      -- More Clothing Items
      ('jacket', 'áo khoác', 'ˈdʒækɪt', 'Wear a jacket when cold.', 'beginner', 'noun', NOW(), NOW()),
      ('sweater', 'áo len', 'ˈswetər', 'Wool sweater is warm.', 'beginner', 'noun', NOW(), NOW()),
      ('jeans', 'quần jean', 'dʒiːnz', 'Blue jeans are popular.', 'beginner', 'noun', NOW(), NOW()),
      ('skirt', 'váy ngắn', 'skɜːrt', 'She wears a short skirt.', 'beginner', 'noun', NOW(), NOW()),
      ('shorts', 'quần ngắn', 'ʃɔːrts', 'Wear shorts in summer.', 'beginner', 'noun', NOW(), NOW()),
      ('socks', 'tất', 'sɑːks', 'Put on your socks.', 'beginner', 'noun', NOW(), NOW()),
      ('underwear', 'đồ lót', 'ˈʌndərwer', 'Change your underwear daily.', 'beginner', 'noun', NOW(), NOW()),
      ('gloves', 'găng tay', 'ɡlʌvz', 'Wear gloves in winter.', 'beginner', 'noun', NOW(), NOW()),
      ('scarf', 'khăn quàng cổ', 'skɑːrf', 'Silk scarf is beautiful.', 'beginner', 'noun', NOW(), NOW()),
      ('belt', 'thắt lưng', 'belt', 'Tighten your belt.', 'beginner', 'noun', NOW(), NOW()),
      ('tie', 'cà vạt', 'taɪ', 'Men wear ties to work.', 'beginner', 'noun', NOW(), NOW()),

      -- Kitchen and Cooking
      ('cook', 'nấu ăn', 'kʊk', 'I cook dinner every night.', 'beginner', 'verb', NOW(), NOW()),
      ('recipe', 'công thức nấu ăn', 'ˈresəpi', 'Follow the recipe carefully.', 'beginner', 'noun', NOW(), NOW()),
      ('ingredient', 'nguyên liệu', 'ɪnˈɡriːdiənt', 'Fresh ingredients taste better.', 'beginner', 'noun', NOW(), NOW()),
      ('knife', 'con dao', 'naɪf', 'Cut vegetables with a knife.', 'beginner', 'noun', NOW(), NOW()),
      ('fork', 'cái nĩa', 'fɔːrk', 'Eat with a fork.', 'beginner', 'noun', NOW(), NOW()),
      ('spoon', 'cái thìa', 'spuːn', 'Stir soup with a spoon.', 'beginner', 'noun', NOW(), NOW()),
      ('plate', 'đĩa', 'pleɪt', 'Put food on the plate.', 'beginner', 'noun', NOW(), NOW()),
      ('bowl', 'tô', 'boʊl', 'Eat rice from a bowl.', 'beginner', 'noun', NOW(), NOW()),
      ('cup', 'cốc', 'kʌp', 'Drink tea from a cup.', 'beginner', 'noun', NOW(), NOW()),
      ('glass', 'ly', 'ɡlæs', 'Pour water in the glass.', 'beginner', 'noun', NOW(), NOW()),
      ('bottle', 'chai', 'ˈbɑːtl', 'Water bottle is empty.', 'beginner', 'noun', NOW(), NOW()),
      ('pot', 'nồi', 'pɑːt', 'Cook soup in a pot.', 'beginner', 'noun', NOW(), NOW()),
      ('pan', 'chảo', 'pæn', 'Fry eggs in a pan.', 'beginner', 'noun', NOW(), NOW()),

      -- Directions and Locations
      ('direction', 'hướng', 'dəˈrekʃən', 'Which direction is north?', 'beginner', 'noun', NOW(), NOW()),
      ('north', 'phía bắc', 'nɔːrθ', 'Canada is north of USA.', 'beginner', 'noun', NOW(), NOW()),
      ('south', 'phía nam', 'saʊθ', 'Birds fly south in winter.', 'beginner', 'noun', NOW(), NOW()),
      ('east', 'phía đông', 'iːst', 'The sun rises in the east.', 'beginner', 'noun', NOW(), NOW()),
      ('west', 'phía tây', 'west', 'The sun sets in the west.', 'beginner', 'noun', NOW(), NOW()),
      ('left', 'trái', 'left', 'Turn left at the corner.', 'beginner', 'noun', NOW(), NOW()),
      ('right', 'phải', 'raɪt', 'Turn right here.', 'beginner', 'noun', NOW(), NOW()),
      ('straight', 'thẳng', 'streɪt', 'Go straight ahead.', 'beginner', 'adverb', NOW(), NOW()),
      ('corner', 'góc', 'ˈkɔːrnər', 'Meet me at the corner.', 'beginner', 'noun', NOW(), NOW()),
      ('address', 'địa chỉ', 'əˈdres', 'What''s your address?', 'beginner', 'noun', NOW(), NOW()),
      ('map', 'bản đồ', 'mæp', 'Look at the map.', 'beginner', 'noun', NOW(), NOW()),

      -- School Subjects
      ('math', 'toán', 'mæθ', 'Math is difficult.', 'beginner', 'noun', NOW(), NOW()),
      ('English', 'tiếng Anh', 'ˈɪŋɡlɪʃ', 'I study English.', 'beginner', 'noun', NOW(), NOW()),
      ('science', 'khoa học', 'ˈsaɪəns', 'Science is interesting.', 'beginner', 'noun', NOW(), NOW()),
      ('history', 'lịch sử', 'ˈhɪstəri', 'History tells us about the past.', 'beginner', 'noun', NOW(), NOW()),
      ('geography', 'địa lý', 'dʒiˈɑːɡrəfi', 'Geography teaches about countries.', 'beginner', 'noun', NOW(), NOW()),
      ('art', 'mỹ thuật', 'ɑːrt', 'Art class is creative.', 'beginner', 'noun', NOW(), NOW()),
      ('music', 'âm nhạc', 'ˈmjuːzɪk', 'Music class is fun.', 'beginner', 'noun', NOW(), NOW()),
      ('physical education', 'thể dục', 'ˈfɪzɪkəl edʒuˈkeɪʃən', 'PE keeps us healthy.', 'beginner', 'noun', NOW(), NOW()),
      ('chemistry', 'hóa học', 'ˈkeməstri', 'Chemistry studies elements.', 'beginner', 'noun', NOW(), NOW()),
      ('biology', 'sinh học', 'baɪˈɑːlədʒi', 'Biology studies life.', 'beginner', 'noun', NOW(), NOW()),
      ('physics', 'vật lý', 'ˈfɪzɪks', 'Physics explains how things work.', 'beginner', 'noun', NOW(), NOW()),

      -- Common Verbs (continued)
      ('try', 'thử', 'traɪ', 'Try your best.', 'beginner', 'verb', NOW(), NOW()),
      ('use', 'sử dụng', 'juːz', 'Use this pen.', 'beginner', 'verb', NOW(), NOW()),
      ('show', 'cho xem', 'ʃoʊ', 'Show me your homework.', 'beginner', 'verb', NOW(), NOW()),
      ('follow', 'theo', 'ˈfɑːloʊ', 'Follow me.', 'beginner', 'verb', NOW(), NOW()),
      ('lead', 'dẫn đầu', 'liːd', 'Lead the way.', 'beginner', 'verb', NOW(), NOW()),
      ('join', 'tham gia', 'dʒɔɪn', 'Join our club.', 'beginner', 'verb', NOW(), NOW()),
      ('leave', 'rời khỏi', 'liːv', 'Leave the room quietly.', 'beginner', 'verb', NOW(), NOW()),
      ('enter', 'vào', 'ˈentər', 'Enter the building.', 'beginner', 'verb', NOW(), NOW()),
      ('exit', 'ra', 'ˈeɡzɪt', 'Exit through the back door.', 'beginner', 'verb', NOW(), NOW()),
      ('wait', 'đợi', 'weɪt', 'Wait for me.', 'beginner', 'verb', NOW(), NOW()),
      ('hurry', 'vội vàng', 'ˈhɜːri', 'Hurry up!', 'beginner', 'verb', NOW(), NOW()),
      ('relax', 'thư giãn', 'rɪˈlæks', 'Relax and rest.', 'beginner', 'verb', NOW(), NOW()),
      ('rest', 'nghỉ ngơi', 'rest', 'Rest when you''re tired.', 'beginner', 'verb', NOW(), NOW()),
      ('wake up', 'thức dậy', 'weɪk ʌp', 'Wake up early.', 'beginner', 'phrasal verb', NOW(), NOW()),
      ('get up', 'dậy', 'ɡet ʌp', 'Get up from bed.', 'beginner', 'phrasal verb', NOW(), NOW()),
      ('lie down', 'nằm xuống', 'laɪ daʊn', 'Lie down and rest.', 'beginner', 'phrasal verb', NOW(), NOW()),
      ('pick up', 'nhặt lên', 'pɪk ʌp', 'Pick up the book.', 'beginner', 'phrasal verb', NOW(), NOW()),
      ('put down', 'đặt xuống', 'pʊt daʊn', 'Put down the heavy box.', 'beginner', 'phrasal verb', NOW(), NOW()),
      ('turn on', 'bật', 'tɜːrn ɑːn', 'Turn on the light.', 'beginner', 'phrasal verb', NOW(), NOW()),
      ('turn off', 'tắt', 'tɜːrn ɔːf', 'Turn off the TV.', 'beginner', 'phrasal verb', NOW(), NOW()),

      -- Weather Conditions
      ('sunny', 'nắng', 'ˈsʌni', 'Today is sunny.', 'beginner', 'adjective', NOW(), NOW()),
      ('cloudy', 'có mây', 'ˈklaʊdi', 'It''s cloudy outside.', 'beginner', 'adjective', NOW(), NOW()),
      ('rainy', 'mưa', 'ˈreɪni', 'It''s a rainy day.', 'beginner', 'adjective', NOW(), NOW()),
      ('snowy', 'có tuyết', 'ˈsnoʊi', 'Christmas is often snowy.', 'beginner', 'adjective', NOW(), NOW()),
      ('windy', 'có gió', 'ˈwɪndi', 'It''s too windy to fly a kite.', 'beginner', 'adjective', NOW(), NOW()),
      ('stormy', 'có bão', 'ˈstɔːrmi', 'Stay inside during stormy weather.', 'beginner', 'adjective', NOW(), NOW()),
      ('foggy', 'có sương mù', 'ˈfɔːɡi', 'Drive carefully in foggy weather.', 'beginner', 'adjective', NOW(), NOW()),
      ('humidity', 'độ ẩm', 'hjuːˈmɪdəti', 'High humidity makes it uncomfortable.', 'beginner', 'noun', NOW(), NOW()),
      ('temperature', 'nhiệt độ', 'ˈtemprətʃər', 'Check the temperature.', 'beginner', 'noun', NOW(), NOW()),

      -- Basic Materials and Objects
      ('wood', 'gỗ', 'wʊd', 'The table is made of wood.', 'beginner', 'noun', NOW(), NOW()),
      ('metal', 'kim loại', 'ˈmetl', 'The car is made of metal.', 'beginner', 'noun', NOW(), NOW()),
      ('plastic', 'nhựa', 'ˈplæstɪk', 'Don''t use too much plastic.', 'beginner', 'noun', NOW(), NOW()),
      ('glass', 'thủy tinh', 'ɡlæs', 'Be careful with glass.', 'beginner', 'noun', NOW(), NOW()),
      ('paper', 'giấy', 'ˈpeɪpər', 'Write on paper.', 'beginner', 'noun', NOW(), NOW()),
      ('cloth', 'vải', 'klɔːθ', 'Clean with a cloth.', 'beginner', 'noun', NOW(), NOW()),
      ('leather', 'da', 'ˈleðər', 'Leather shoes are expensive.', 'beginner', 'noun', NOW(), NOW()),
      ('stone', 'đá', 'stoʊn', 'The wall is made of stone.', 'beginner', 'noun', NOW(), NOW()),
      ('brick', 'gạch', 'brɪk', 'Build house with bricks.', 'beginner', 'noun', NOW(), NOW()),

      -- Basic Shapes
      ('circle', 'hình tròn', 'ˈsɜːrkl', 'Draw a circle.', 'beginner', 'noun', NOW(), NOW()),
      ('square', 'hình vuông', 'skwer', 'A square has four sides.', 'beginner', 'noun', NOW(), NOW()),
      ('triangle', 'tam giác', 'ˈtraɪæŋɡl', 'A triangle has three sides.', 'beginner', 'noun', NOW(), NOW()),
      ('rectangle', 'hình chữ nhật', 'ˈrektæŋɡl', 'A rectangle is longer than wide.', 'beginner', 'noun', NOW(), NOW()),
      ('oval', 'hình bầu dục', 'ˈoʊvəl', 'An egg is oval-shaped.', 'beginner', 'noun', NOW(), NOW()),
      ('round', 'tròn', 'raʊnd', 'The ball is round.', 'beginner', 'adjective', NOW(), NOW()),
      ('flat', 'phẳng', 'flæt', 'The table is flat.', 'beginner', 'adjective', NOW(), NOW()),
      ('sharp', 'sắc', 'ʃɑːrp', 'The knife is sharp.', 'beginner', 'adjective', NOW(), NOW()),
      ('smooth', 'mượt', 'smuːð', 'The stone is smooth.', 'beginner', 'adjective', NOW(), NOW()),
      ('rough', 'thô ráp', 'rʌf', 'Tree bark is rough.', 'beginner', 'adjective', NOW(), NOW())
      ON CONFLICT (word) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM vocabulary WHERE word IN ('eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen')`);
  }
}
