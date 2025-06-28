import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedBasicVocabulary81703800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO vocabulary (word, meaning, pronunciation, example, level, "partOfSpeech", "createdAt", "updatedAt") VALUES
      -- Entertainment and Media
      ('theater', 'rạp hát', 'ˈθiːətər', 'Watch play at theater.', 'beginner', 'noun', NOW(), NOW()),
      ('cinema', 'rạp chiếu phim', 'ˈsɪnəmə', 'Go to cinema tonight.', 'beginner', 'noun', NOW(), NOW()),
      ('concert', 'buổi hòa nhạc', 'ˈkɑːnsərt', 'Attend rock concert.', 'beginner', 'noun', NOW(), NOW()),
      ('festival', 'lễ hội', 'ˈfestəvl', 'Music festival is fun.', 'beginner', 'noun', NOW(), NOW()),
      ('circus', 'rạp xiếc', 'ˈsɜːrkəs', 'Clowns perform at circus.', 'beginner', 'noun', NOW(), NOW()),
      ('zoo', 'sở thú', 'zuː', 'See animals at zoo.', 'beginner', 'noun', NOW(), NOW()),
      ('aquarium', 'thủy cung', 'əˈkweriəm', 'Fish swim in aquarium.', 'beginner', 'noun', NOW(), NOW()),
      ('amusement park', 'công viên giải trí', 'əˈmjuːzmənt pɑːrk', 'Ride roller coaster at amusement park.', 'beginner', 'noun', NOW(), NOW()),
      ('playground', 'sân chơi', 'ˈpleɪɡraʊnd', 'Children play at playground.', 'beginner', 'noun', NOW(), NOW()),

      -- Transportation Vehicles
      ('ambulance', 'xe cứu thương', 'ˈæmbjələns', 'Ambulance helps sick people.', 'beginner', 'noun', NOW(), NOW()),
      ('fire truck', 'xe cứu hỏa', 'faɪər trʌk', 'Fire truck puts out fires.', 'beginner', 'noun', NOW(), NOW()),
      ('police car', 'xe cảnh sát', 'pəˈliːs kɑːr', 'Police car patrols streets.', 'beginner', 'noun', NOW(), NOW()),
      ('garbage truck', 'xe rác', 'ˈɡɑːrbɪdʒ trʌk', 'Garbage truck collects trash.', 'beginner', 'noun', NOW(), NOW()),
      ('school bus', 'xe buýt trường học', 'skuːl bʌs', 'School bus is yellow.', 'beginner', 'noun', NOW(), NOW()),
      ('delivery truck', 'xe giao hàng', 'dɪˈlɪvəri trʌk', 'Delivery truck brings packages.', 'beginner', 'noun', NOW(), NOW()),
      ('tractor', 'máy kéo', 'ˈtræktər', 'Farmer uses tractor.', 'beginner', 'noun', NOW(), NOW()),
      ('excavator', 'máy xúc', 'ˈekskəveɪtər', 'Excavator digs holes.', 'beginner', 'noun', NOW(), NOW()),

      -- Clothing Accessories
      ('jewelry', 'đồ trang sức', 'ˈdʒuːəlri', 'She wears beautiful jewelry.', 'beginner', 'noun', NOW(), NOW()),
      ('necklace', 'dây chuyền', 'ˈnekləs', 'Gold necklace around neck.', 'beginner', 'noun', NOW(), NOW()),
      ('bracelet', 'vòng tay', 'ˈbreɪslət', 'Silver bracelet on wrist.', 'beginner', 'noun', NOW(), NOW()),
      ('ring', 'nhẫn', 'rɪŋ', 'Wedding ring on finger.', 'beginner', 'noun', NOW(), NOW()),
      ('earrings', 'bông tai', 'ˈɪrɪŋz', 'Diamond earrings sparkle.', 'beginner', 'noun', NOW(), NOW()),
      ('sunglasses', 'kính râm', 'ˈsʌnɡlæsəz', 'Wear sunglasses in sun.', 'beginner', 'noun', NOW(), NOW()),
      ('glasses', 'kính mắt', 'ˈɡlæsəz', 'I need glasses to read.', 'beginner', 'noun', NOW(), NOW()),
      ('purse', 'ví cầm tay', 'pɜːrs', 'Money in the purse.', 'beginner', 'noun', NOW(), NOW()),
      ('wallet', 'ví tiền', 'ˈwɑːlət', 'Keep cards in wallet.', 'beginner', 'noun', NOW(), NOW()),
      ('backpack', 'ba lô', 'ˈbækpæk', 'Carry books in backpack.', 'beginner', 'noun', NOW(), NOW()),
      ('handbag', 'túi xách', 'ˈhændbæɡ', 'Ladies carry handbag.', 'beginner', 'noun', NOW(), NOW()),

      -- Medical and Health
      ('pharmacy', 'hiệu thuốc', 'ˈfɑːrməsi', 'Buy medicine at pharmacy.', 'beginner', 'noun', NOW(), NOW()),
      ('clinic', 'phòng khám', 'ˈklɪnɪk', 'Visit clinic when sick.', 'beginner', 'noun', NOW(), NOW()),
      ('dentist', 'nha sĩ', 'ˈdentɪst', 'See dentist for teeth.', 'beginner', 'noun', NOW(), NOW()),
      ('surgeon', 'bác sĩ phẫu thuật', 'ˈsɜːrdʒən', 'Surgeon performs operations.', 'beginner', 'noun', NOW(), NOW()),
      ('patient', 'bệnh nhân', 'ˈpeɪʃnt', 'Patient waits for doctor.', 'beginner', 'noun', NOW(), NOW()),
      ('injection', 'tiêm', 'ɪnˈdʒekʃn', 'Get injection for flu.', 'beginner', 'noun', NOW(), NOW()),
      ('pill', 'viên thuốc', 'pɪl', 'Take pill with water.', 'beginner', 'noun', NOW(), NOW()),
      ('tablet', 'viên thuốc', 'ˈtæblət', 'Swallow tablet whole.', 'beginner', 'noun', NOW(), NOW()),
      ('capsule', 'viên nang', 'ˈkæpsuːl', 'Capsule dissolves quickly.', 'beginner', 'noun', NOW(), NOW()),
      ('bandaid', 'băng cá nhân', 'ˈbændɪd', 'Put bandaid on cut.', 'beginner', 'noun', NOW(), NOW()),

      -- Communication
      ('letter', 'thư', 'ˈletər', 'Write letter to friend.', 'beginner', 'noun', NOW(), NOW()),
      ('postcard', 'bưu thiếp', 'ˈpoʊstkɑːrd', 'Send postcard from vacation.', 'beginner', 'noun', NOW(), NOW()),
      ('envelope', 'phong bì', 'ˈenvəloʊp', 'Put letter in envelope.', 'beginner', 'noun', NOW(), NOW()),
      ('stamp', 'tem', 'stæmp', 'Attach stamp to letter.', 'beginner', 'noun', NOW(), NOW()),
      ('package', 'gói hàng', 'ˈpækɪdʒ', 'Receive package from store.', 'beginner', 'noun', NOW(), NOW()),
      ('mailbox', 'hộp thư', 'ˈmeɪlbɑːks', 'Check mailbox daily.', 'beginner', 'noun', NOW(), NOW()),
      ('newspaper', 'báo', 'ˈnuːzpeɪpər', 'Read newspaper every morning.', 'beginner', 'noun', NOW(), NOW()),
      ('magazine', 'tạp chí', 'ˈmæɡəziːn', 'Fashion magazine is popular.', 'beginner', 'noun', NOW(), NOW()),
      ('advertisement', 'quảng cáo', 'ˌædvərˈtaɪzmənt', 'TV has many advertisements.', 'beginner', 'noun', NOW(), NOW()),

      -- Tools and Equipment
      ('hammer', 'búa', 'ˈhæmər', 'Hit nail with hammer.', 'beginner', 'noun', NOW(), NOW()),
      ('screwdriver', 'tuốc nơ vít', 'ˈskruːdraɪvər', 'Tighten screw with screwdriver.', 'beginner', 'noun', NOW(), NOW()),
      ('saw', 'cưa', 'sɔː', 'Cut wood with saw.', 'beginner', 'noun', NOW(), NOW()),
      ('drill', 'máy khoan', 'drɪl', 'Make hole with drill.', 'beginner', 'noun', NOW(), NOW()),
      ('wrench', 'cờ lê', 'rentʃ', 'Turn bolt with wrench.', 'beginner', 'noun', NOW(), NOW()),
      ('pliers', 'kìm', 'ˈplaɪərz', 'Grip wire with pliers.', 'beginner', 'noun', NOW(), NOW()),
      ('ladder', 'thang', 'ˈlædər', 'Climb ladder to roof.', 'beginner', 'noun', NOW(), NOW()),
      ('rope', 'dây thừng', 'roʊp', 'Tie with strong rope.', 'beginner', 'noun', NOW(), NOW()),
      ('nail', 'đinh', 'neɪl', 'Hammer nail into wood.', 'beginner', 'noun', NOW(), NOW()),
      ('screw', 'vít', 'skruː', 'Turn screw clockwise.', 'beginner', 'noun', NOW(), NOW()),

      -- Containers and Storage
      ('box', 'hộp', 'bɑːks', 'Put toys in box.', 'beginner', 'noun', NOW(), NOW()),
      ('container', 'hộp đựng', 'kənˈteɪnər', 'Store food in container.', 'beginner', 'noun', NOW(), NOW()),
      ('jar', 'lọ', 'dʒɑːr', 'Honey in glass jar.', 'beginner', 'noun', NOW(), NOW()),
      ('can', 'lon', 'kæn', 'Open can of soup.', 'beginner', 'noun', NOW(), NOW()),
      ('bag', 'túi', 'bæɡ', 'Carry groceries in bag.', 'beginner', 'noun', NOW(), NOW()),
      ('suitcase', 'vali', 'ˈsuːtkeɪs', 'Pack clothes in suitcase.', 'beginner', 'noun', NOW(), NOW()),
      ('briefcase', 'cặp công sở', 'ˈbriːfkeɪs', 'Businessman carries briefcase.', 'beginner', 'noun', NOW(), NOW()),
      ('basket', 'giỏ', 'ˈbæskət', 'Carry fruit in basket.', 'beginner', 'noun', NOW(), NOW()),
      ('crate', 'thùng gỗ', 'kreɪt', 'Ship goods in crate.', 'beginner', 'noun', NOW(), NOW()),
      ('barrel', 'thùng tròn', 'ˈbærəl', 'Store oil in barrel.', 'beginner', 'noun', NOW(), NOW()),

      -- Measurements
      ('inch', 'inch', 'ɪntʃ', 'Twelve inches make foot.', 'beginner', 'noun', NOW(), NOW()),
      ('foot', 'foot', 'fʊt', 'I am six feet tall.', 'beginner', 'noun', NOW(), NOW()),
      ('yard', 'yard', 'jɑːrd', 'Three feet make yard.', 'beginner', 'noun', NOW(), NOW()),
      ('mile', 'dặm', 'maɪl', 'School is two miles away.', 'beginner', 'noun', NOW(), NOW()),
      ('pound', 'pound', 'paʊnd', 'Baby weighs eight pounds.', 'beginner', 'noun', NOW(), NOW()),
      ('ounce', 'ounce', 'aʊns', 'Sixteen ounces make pound.', 'beginner', 'noun', NOW(), NOW()),
      ('gallon', 'gallon', 'ˈɡælən', 'Car needs ten gallons.', 'beginner', 'noun', NOW(), NOW()),
      ('quart', 'quart', 'kwɔːrt', 'Four quarts make gallon.', 'beginner', 'noun', NOW(), NOW()),
      ('pint', 'pint', 'paɪnt', 'Two pints make quart.', 'beginner', 'noun', NOW(), NOW()),
      ('cup', 'cup (đo lường)', 'kʌp', 'Recipe needs two cups flour.', 'beginner', 'noun', NOW(), NOW()),

      -- Basic Science
      ('science', 'khoa học', 'ˈsaɪəns', 'Science explains nature.', 'beginner', 'noun', NOW(), NOW()),
      ('experiment', 'thí nghiệm', 'ɪkˈsperəmənt', 'Do experiment in lab.', 'beginner', 'noun', NOW(), NOW()),
      ('laboratory', 'phòng thí nghiệm', 'ˈlæbrətɔːri', 'Scientists work in laboratory.', 'beginner', 'noun', NOW(), NOW()),
      ('microscope', 'kính hiển vi', 'ˈmaɪkrəskoʊp', 'See bacteria with microscope.', 'beginner', 'noun', NOW(), NOW()),
      ('telescope', 'kính thiên văn', 'ˈteləskoʊp', 'Look at stars with telescope.', 'beginner', 'noun', NOW(), NOW()),
      ('atom', 'nguyên tử', 'ˈætəm', 'Everything made of atoms.', 'beginner', 'noun', NOW(), NOW()),
      ('molecule', 'phân tử', 'ˈmɑːləkjuːl', 'Water molecule has oxygen.', 'beginner', 'noun', NOW(), NOW()),
      ('chemical', 'hóa chất', 'ˈkemɪkl', 'Handle chemical carefully.', 'beginner', 'noun', NOW(), NOW()),
      ('element', 'nguyên tố', 'ˈeləmənt', 'Gold is precious element.', 'beginner', 'noun', NOW(), NOW()),
      ('energy', 'năng lượng', 'ˈenərdʒi', 'Solar panels use sun energy.', 'beginner', 'noun', NOW(), NOW()),

      -- More Abstract Concepts
      ('idea', 'ý tưởng', 'aɪˈdiːə', 'That''s a good idea.', 'beginner', 'noun', NOW(), NOW()),
      ('thought', 'suy nghĩ', 'θɔːt', 'Share your thoughts.', 'beginner', 'noun', NOW(), NOW()),
      ('opinion', 'ý kiến', 'əˈpɪnjən', 'Everyone has opinion.', 'beginner', 'noun', NOW(), NOW()),
      ('belief', 'niềm tin', 'bɪˈliːf', 'Strong belief in success.', 'beginner', 'noun', NOW(), NOW()),
      ('faith', 'đức tin', 'feɪθ', 'Have faith in yourself.', 'beginner', 'noun', NOW(), NOW()),
      ('dream', 'giấc mơ', 'driːm', 'Sweet dreams tonight.', 'beginner', 'noun', NOW(), NOW()),
      ('nightmare', 'ác mộng', 'ˈnaɪtmer', 'Bad nightmare scared me.', 'beginner', 'noun', NOW(), NOW()),
      ('memory', 'ký ức', 'ˈmeməri', 'Childhood memory is sweet.', 'beginner', 'noun', NOW(), NOW()),
      ('imagination', 'trí tưởng tượng', 'ɪˌmædʒəˈneɪʃn', 'Children have wild imagination.', 'beginner', 'noun', NOW(), NOW()),
      ('creativity', 'sự sáng tạo', 'ˌkriːeɪˈtɪvəti', 'Art requires creativity.', 'beginner', 'noun', NOW(), NOW()),

      -- More Descriptive Words
      ('empty', 'trống', 'ˈempti', 'The box is empty.', 'beginner', 'adjective', NOW(), NOW()),
      ('full', 'đầy', 'fʊl', 'The glass is full.', 'beginner', 'adjective', NOW(), NOW()),
      ('open', 'mở', 'ˈoʊpən', 'The door is open.', 'beginner', 'adjective', NOW(), NOW()),
      ('closed', 'đóng', 'kloʊzd', 'The store is closed.', 'beginner', 'adjective', NOW(), NOW()),
      ('broken', 'hỏng', 'ˈbroʊkən', 'The toy is broken.', 'beginner', 'adjective', NOW(), NOW()),
      ('fixed', 'đã sửa', 'fɪkst', 'The car is fixed now.', 'beginner', 'adjective', NOW(), NOW()),
      ('wet', 'ướt', 'wet', 'My clothes are wet.', 'beginner', 'adjective', NOW(), NOW()),
      ('dry', 'khô', 'draɪ', 'The towel is dry.', 'beginner', 'adjective', NOW(), NOW()),
      ('frozen', 'đông lạnh', 'ˈfroʊzən', 'The lake is frozen.', 'beginner', 'adjective', NOW(), NOW()),
      ('melted', 'tan chảy', 'ˈmeltəd', 'The ice cream melted.', 'beginner', 'adjective', NOW(), NOW()),
      ('solid', 'rắn', 'ˈsɑːləd', 'Ice is solid water.', 'beginner', 'adjective', NOW(), NOW()),
      ('liquid', 'lỏng', 'ˈlɪkwəd', 'Water is liquid.', 'beginner', 'adjective', NOW(), NOW()),
      ('soft', 'mềm', 'sɔːft', 'The pillow is soft.', 'beginner', 'adjective', NOW(), NOW()),
      ('hard', 'cứng', 'hɑːrd', 'The rock is hard.', 'beginner', 'adjective', NOW(), NOW()),
      ('tight', 'chật', 'taɪt', 'These shoes are tight.', 'beginner', 'adjective', NOW(), NOW()),
      ('loose', 'rộng', 'luːs', 'This shirt is loose.', 'beginner', 'adjective', NOW(), NOW()),
      ('thick', 'dày', 'θɪk', 'The book is thick.', 'beginner', 'adjective', NOW(), NOW()),
      ('thin', 'mỏng', 'θɪn', 'The paper is thin.', 'beginner', 'adjective', NOW(), NOW())
      ON CONFLICT (word) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM vocabulary WHERE word IN ('theater', 'cinema', 'concert', 'festival', 'circus')`);
  }
}
