import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedBasicVocabulary61703600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO vocabulary (word, meaning, pronunciation, example, level, "partOfSpeech", "createdAt", "updatedAt") VALUES
      -- More Transportation
      ('subway', 'tàu điện ngầm', 'ˈsʌbweɪ', 'Take the subway to downtown.', 'beginner', 'noun', NOW(), NOW()),
      ('helicopter', 'trực thăng', 'ˈhelɪkɑːptər', 'The helicopter flies overhead.', 'beginner', 'noun', NOW(), NOW()),
      ('rocket', 'tên lửa', 'ˈrɑːkɪt', 'The rocket goes to space.', 'beginner', 'noun', NOW(), NOW()),
      ('scooter', 'xe scooter', 'ˈskuːtər', 'Ride the scooter to school.', 'beginner', 'noun', NOW(), NOW()),
      ('skateboard', 'ván trượt', 'ˈskeɪtbɔːrd', 'Kids love skateboard.', 'beginner', 'noun', NOW(), NOW()),
      ('rollerblade', 'giày trượt patin', 'ˈroʊlərbleɪd', 'Rollerblade in the park.', 'beginner', 'noun', NOW(), NOW()),

      -- Building and Architecture
      ('building', 'tòa nhà', 'ˈbɪldɪŋ', 'The building is tall.', 'beginner', 'noun', NOW(), NOW()),
      ('apartment', 'căn hộ', 'əˈpɑːrtmənt', 'I live in an apartment.', 'beginner', 'noun', NOW(), NOW()),
      ('office', 'văn phòng', 'ˈɔːfɪs', 'Work in the office.', 'beginner', 'noun', NOW(), NOW()),
      ('factory', 'nhà máy', 'ˈfæktəri', 'The factory makes cars.', 'beginner', 'noun', NOW(), NOW()),
      ('store', 'cửa hàng', 'stɔːr', 'Buy food at the store.', 'beginner', 'noun', NOW(), NOW()),
      ('mall', 'trung tâm thương mại', 'mɔːl', 'Shop at the mall.', 'beginner', 'noun', NOW(), NOW()),
      ('garage', 'nhà để xe', 'ɡəˈrɑːʒ', 'Park car in garage.', 'beginner', 'noun', NOW(), NOW()),
      ('basement', 'tầng hầm', 'ˈbeɪsmənt', 'Storage in the basement.', 'beginner', 'noun', NOW(), NOW()),
      ('attic', 'gác mái', 'ˈætɪk', 'Old things in the attic.', 'beginner', 'noun', NOW(), NOW()),
      ('roof', 'mái nhà', 'ruːf', 'Birds sit on the roof.', 'beginner', 'noun', NOW(), NOW()),
      ('wall', 'tường', 'wɔːl', 'Paint the wall white.', 'beginner', 'noun', NOW(), NOW()),
      ('floor', 'sàn nhà', 'flɔːr', 'Clean the floor.', 'beginner', 'noun', NOW(), NOW()),
      ('ceiling', 'trần nhà', 'ˈsiːlɪŋ', 'Light hangs from ceiling.', 'beginner', 'noun', NOW(), NOW()),
      ('stairs', 'cầu thang', 'sterz', 'Walk up the stairs.', 'beginner', 'noun', NOW(), NOW()),
      ('elevator', 'thang máy', 'ˈelɪveɪtər', 'Take elevator to 5th floor.', 'beginner', 'noun', NOW(), NOW()),
      ('escalator', 'thang cuốn', 'ˈeskəleɪtər', 'Use escalator in mall.', 'beginner', 'noun', NOW(), NOW()),

      -- Electronics and Appliances
      ('radio', 'đài radio', 'ˈreɪdioʊ', 'Listen to radio.', 'beginner', 'noun', NOW(), NOW()),
      ('microwave', 'lò vi sóng', 'ˈmaɪkrəweɪv', 'Heat food in microwave.', 'beginner', 'noun', NOW(), NOW()),
      ('washing machine', 'máy giặt', 'ˈwɑːʃɪŋ məˈʃiːn', 'Wash clothes in washing machine.', 'beginner', 'noun', NOW(), NOW()),
      ('dryer', 'máy sấy', 'ˈdraɪər', 'Dry clothes in dryer.', 'beginner', 'noun', NOW(), NOW()),
      ('dishwasher', 'máy rửa bát', 'ˈdɪʃwɑːʃər', 'Clean dishes in dishwasher.', 'beginner', 'noun', NOW(), NOW()),
      ('vacuum cleaner', 'máy hút bụi', 'ˈvækjuːm ˈkliːnər', 'Clean carpet with vacuum.', 'beginner', 'noun', NOW(), NOW()),
      ('air conditioner', 'điều hòa', 'er kənˈdɪʃənər', 'Cool room with air conditioner.', 'beginner', 'noun', NOW(), NOW()),
      ('heater', 'máy sưởi', 'ˈhiːtər', 'Warm room with heater.', 'beginner', 'noun', NOW(), NOW()),
      ('fan', 'quạt', 'fæn', 'Use fan when hot.', 'beginner', 'noun', NOW(), NOW()),
      ('clock', 'đồng hồ', 'klɑːk', 'Check time on clock.', 'beginner', 'noun', NOW(), NOW()),
      ('alarm clock', 'đồng hồ báo thức', 'əˈlɑːrm klɑːk', 'Wake up with alarm clock.', 'beginner', 'noun', NOW(), NOW()),
      ('watch', 'đồng hồ đeo tay', 'wɑːtʃ', 'Wear watch on wrist.', 'beginner', 'noun', NOW(), NOW()),

      -- Furniture and Home Items
      ('sofa', 'ghế sofa', 'ˈsoʊfə', 'Sit on the sofa.', 'beginner', 'noun', NOW(), NOW()),
      ('couch', 'ghế dài', 'kaʊtʃ', 'Relax on the couch.', 'beginner', 'noun', NOW(), NOW()),
      ('armchair', 'ghế bành', 'ˈɑːrmtʃer', 'Read in the armchair.', 'beginner', 'noun', NOW(), NOW()),
      ('bookshelf', 'kệ sách', 'ˈbʊkʃelf', 'Books on the bookshelf.', 'beginner', 'noun', NOW(), NOW()),
      ('closet', 'tủ quần áo', 'ˈklɑːzət', 'Hang clothes in closet.', 'beginner', 'noun', NOW(), NOW()),
      ('drawer', 'ngăn kéo', 'drɔːr', 'Put socks in drawer.', 'beginner', 'noun', NOW(), NOW()),
      ('cabinet', 'tủ', 'ˈkæbənət', 'Store dishes in cabinet.', 'beginner', 'noun', NOW(), NOW()),
      ('shelf', 'kệ', 'ʃelf', 'Put books on shelf.', 'beginner', 'noun', NOW(), NOW()),
      ('mirror', 'gương', 'ˈmɪrər', 'Look in the mirror.', 'beginner', 'noun', NOW(), NOW()),
      ('curtain', 'rèm cửa', 'ˈkɜːrtən', 'Close the curtain.', 'beginner', 'noun', NOW(), NOW()),
      ('carpet', 'thảm', 'ˈkɑːrpət', 'Walk on the carpet.', 'beginner', 'noun', NOW(), NOW()),
      ('rug', 'tấm thảm nhỏ', 'rʌɡ', 'Small rug under table.', 'beginner', 'noun', NOW(), NOW()),
      ('pillow', 'gối', 'ˈpɪloʊ', 'Sleep with pillow.', 'beginner', 'noun', NOW(), NOW()),
      ('blanket', 'chăn', 'ˈblæŋkət', 'Cover with blanket.', 'beginner', 'noun', NOW(), NOW()),
      ('sheet', 'ga trải giường', 'ʃiːt', 'Change bed sheets.', 'beginner', 'noun', NOW(), NOW()),

      -- Office and School Supplies
      ('ruler', 'thước kẻ', 'ˈruːlər', 'Measure with ruler.', 'beginner', 'noun', NOW(), NOW()),
      ('eraser', 'tẩy', 'ɪˈreɪsər', 'Erase mistake with eraser.', 'beginner', 'noun', NOW(), NOW()),
      ('scissors', 'kéo', 'ˈsɪzərz', 'Cut paper with scissors.', 'beginner', 'noun', NOW(), NOW()),
      ('glue', 'keo dán', 'ɡluː', 'Stick with glue.', 'beginner', 'noun', NOW(), NOW()),
      ('tape', 'băng keo', 'teɪp', 'Use tape to attach.', 'beginner', 'noun', NOW(), NOW()),
      ('stapler', 'máy ghim', 'ˈsteɪplər', 'Attach papers with stapler.', 'beginner', 'noun', NOW(), NOW()),
      ('folder', 'thư mục', 'ˈfoʊldər', 'Put documents in folder.', 'beginner', 'noun', NOW(), NOW()),
      ('binder', 'bìa kẹp', 'ˈbaɪndər', 'Organize papers in binder.', 'beginner', 'noun', NOW(), NOW()),
      ('calculator', 'máy tính', 'ˈkælkjəleɪtər', 'Calculate with calculator.', 'beginner', 'noun', NOW(), NOW()),
      ('marker', 'bút dạ', 'ˈmɑːrkər', 'Write with marker.', 'beginner', 'noun', NOW(), NOW()),
      ('highlighter', 'bút tô màu', 'ˈhaɪlaɪtər', 'Highlight important text.', 'beginner', 'noun', NOW(), NOW()),

      -- Common Verbs for Daily Activities
      ('brush', 'chải', 'brʌʃ', 'Brush your teeth.', 'beginner', 'verb', NOW(), NOW()),
      ('comb', 'chải tóc', 'koʊm', 'Comb your hair.', 'beginner', 'verb', NOW(), NOW()),
      ('shower', 'tắm vòi sen', 'ˈʃaʊər', 'Take a shower.', 'beginner', 'verb', NOW(), NOW()),
      ('bathe', 'tắm', 'beɪð', 'Bathe in the tub.', 'beginner', 'verb', NOW(), NOW()),
      ('dress', 'mặc quần áo', 'dres', 'Dress for work.', 'beginner', 'verb', NOW(), NOW()),
      ('undress', 'cởi quần áo', 'ʌnˈdres', 'Undress before bed.', 'beginner', 'verb', NOW(), NOW()),
      ('wear', 'mặc', 'wer', 'Wear warm clothes.', 'beginner', 'verb', NOW(), NOW()),
      ('iron', 'là', 'ˈaɪərn', 'Iron your shirt.', 'beginner', 'verb', NOW(), NOW()),
      ('fold', 'gấp', 'foʊld', 'Fold the clothes.', 'beginner', 'verb', NOW(), NOW()),
      ('hang', 'treo', 'hæŋ', 'Hang clothes in closet.', 'beginner', 'verb', NOW(), NOW()),
      ('vacuum', 'hút bụi', 'ˈvækjuːm', 'Vacuum the floor.', 'beginner', 'verb', NOW(), NOW()),
      ('sweep', 'quét', 'swiːp', 'Sweep the floor.', 'beginner', 'verb', NOW(), NOW()),
      ('mop', 'lau nhà', 'mɑːp', 'Mop the kitchen floor.', 'beginner', 'verb', NOW(), NOW()),
      ('dust', 'lau bụi', 'dʌst', 'Dust the furniture.', 'beginner', 'verb', NOW(), NOW()),
      ('organize', 'sắp xếp', 'ˈɔːrɡənaɪz', 'Organize your desk.', 'beginner', 'verb', NOW(), NOW()),
      ('tidy', 'dọn dẹp', 'ˈtaɪdi', 'Tidy your room.', 'beginner', 'verb', NOW(), NOW()),

      -- More Food and Cooking
      ('breakfast', 'bữa sáng', 'ˈbrekfəst', 'Eat breakfast every morning.', 'beginner', 'noun', NOW(), NOW()),
      ('brunch', 'bữa sáng muộn', 'brʌntʃ', 'Have brunch on Sunday.', 'beginner', 'noun', NOW(), NOW()),
      ('snack', 'đồ ăn vặt', 'snæk', 'Eat healthy snacks.', 'beginner', 'noun', NOW(), NOW()),
      ('meal', 'bữa ăn', 'miːl', 'Enjoy your meal.', 'beginner', 'noun', NOW(), NOW()),
      ('dessert', 'món tráng miệng', 'dɪˈzɜːrt', 'Ice cream for dessert.', 'beginner', 'noun', NOW(), NOW()),
      ('appetizer', 'món khai vị', 'ˈæpətaɪzər', 'Order appetizer first.', 'beginner', 'noun', NOW(), NOW()),
      ('main course', 'món chính', 'meɪn kɔːrs', 'Chicken is the main course.', 'beginner', 'noun', NOW(), NOW()),
      ('beverage', 'đồ uống', 'ˈbevərɪdʒ', 'Choose your beverage.', 'beginner', 'noun', NOW(), NOW()),
      ('ingredient', 'nguyên liệu', 'ɪnˈɡriːdiənt', 'Fresh ingredients are best.', 'beginner', 'noun', NOW(), NOW()),
      ('spice', 'gia vị', 'spaɪs', 'Add spice to food.', 'beginner', 'noun', NOW(), NOW()),
      ('salt', 'muối', 'sɔːlt', 'Add salt to taste.', 'beginner', 'noun', NOW(), NOW()),
      ('pepper', 'tiêu', 'ˈpepər', 'Black pepper is spicy.', 'beginner', 'noun', NOW(), NOW()),
      ('sugar', 'đường', 'ˈʃʊɡər', 'Too much sugar is bad.', 'beginner', 'noun', NOW(), NOW()),
      ('oil', 'dầu', 'ɔɪl', 'Cook with olive oil.', 'beginner', 'noun', NOW(), NOW()),
      ('butter', 'bơ', 'ˈbʌtər', 'Spread butter on bread.', 'beginner', 'noun', NOW(), NOW()),
      ('flour', 'bột mì', 'ˈflaʊər', 'Make bread with flour.', 'beginner', 'noun', NOW(), NOW()),

      -- Health and Body Care
      ('toothbrush', 'bàn chải đánh răng', 'ˈtuːθbrʌʃ', 'Use toothbrush twice daily.', 'beginner', 'noun', NOW(), NOW()),
      ('toothpaste', 'kem đánh răng', 'ˈtuːθpeɪst', 'Put toothpaste on brush.', 'beginner', 'noun', NOW(), NOW()),
      ('soap', 'xà phòng', 'soʊp', 'Wash hands with soap.', 'beginner', 'noun', NOW(), NOW()),
      ('shampoo', 'dầu gội', 'ʃæmˈpuː', 'Wash hair with shampoo.', 'beginner', 'noun', NOW(), NOW()),
      ('towel', 'khăn tắm', 'ˈtaʊəl', 'Dry with towel.', 'beginner', 'noun', NOW(), NOW()),
      ('tissue', 'khăn giấy', 'ˈtɪʃuː', 'Clean with tissue.', 'beginner', 'noun', NOW(), NOW()),
      ('bandage', 'băng', 'ˈbændɪdʒ', 'Cover cut with bandage.', 'beginner', 'noun', NOW(), NOW()),
      ('thermometer', 'nhiệt kế', 'θərˈmɑːmətər', 'Check fever with thermometer.', 'beginner', 'noun', NOW(), NOW()),
      ('vitamin', 'vitamin', 'ˈvaɪtəmɪn', 'Take vitamin C daily.', 'beginner', 'noun', NOW(), NOW()),
      ('exercise', 'tập thể dục', 'ˈeksərsaɪz', 'Exercise keeps you healthy.', 'beginner', 'noun', NOW(), NOW()),

      -- More Emotions and Feelings
      ('excited', 'phấn khích', 'ɪkˈsaɪtɪd', 'I am excited about vacation.', 'beginner', 'adjective', NOW(), NOW()),
      ('bored', 'chán', 'bɔːrd', 'I am bored at home.', 'beginner', 'adjective', NOW(), NOW()),
      ('interested', 'quan tâm', 'ˈɪntrəstɪd', 'I am interested in music.', 'beginner', 'adjective', NOW(), NOW()),
      ('relaxed', 'thư giãn', 'rɪˈlækst', 'I feel relaxed at beach.', 'beginner', 'adjective', NOW(), NOW()),
      ('stressed', 'căng thẳng', 'strest', 'Don''t be stressed about work.', 'beginner', 'adjective', NOW(), NOW()),
      ('lonely', 'cô đơn', 'ˈloʊnli', 'I feel lonely sometimes.', 'beginner', 'adjective', NOW(), NOW()),
      ('jealous', 'ghen tị', 'ˈdʒeləs', 'Don''t be jealous of others.', 'beginner', 'adjective', NOW(), NOW()),
      ('embarrassed', 'xấu hổ', 'ɪmˈbærəst', 'I feel embarrassed.', 'beginner', 'adjective', NOW(), NOW()),
      ('proud', 'tự hào', 'praʊd', 'Parents are proud of children.', 'beginner', 'adjective', NOW(), NOW()),
      ('ashamed', 'xấu hổ', 'əˈʃeɪmd', 'He is ashamed of mistake.', 'beginner', 'adjective', NOW(), NOW()),

      -- Basic Computer Terms
      ('keyboard', 'bàn phím', 'ˈkiːbɔːrd', 'Type on keyboard.', 'beginner', 'noun', NOW(), NOW()),
      ('mouse', 'chuột máy tính', 'maʊs', 'Click with mouse.', 'beginner', 'noun', NOW(), NOW()),
      ('screen', 'màn hình', 'skriːn', 'Look at the screen.', 'beginner', 'noun', NOW(), NOW()),
      ('monitor', 'màn hình máy tính', 'ˈmɑːnɪtər', 'Big monitor for work.', 'beginner', 'noun', NOW(), NOW()),
      ('printer', 'máy in', 'ˈprɪntər', 'Print documents with printer.', 'beginner', 'noun', NOW(), NOW()),
      ('file', 'tập tin', 'faɪl', 'Save the file.', 'beginner', 'noun', NOW(), NOW()),
      ('folder', 'thư mục', 'ˈfoʊldər', 'Create new folder.', 'beginner', 'noun', NOW(), NOW()),
      ('software', 'phần mềm', 'ˈsɔːftwer', 'Install new software.', 'beginner', 'noun', NOW(), NOW()),
      ('application', 'ứng dụng', 'ˌæplɪˈkeɪʃn', 'Open the application.', 'beginner', 'noun', NOW(), NOW()),
      ('program', 'chương trình', 'ˈproʊɡræm', 'Run the program.', 'beginner', 'noun', NOW(), NOW())
      ON CONFLICT (word) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM vocabulary WHERE word IN ('subway', 'helicopter', 'rocket', 'scooter', 'skateboard')`);
  }
}
