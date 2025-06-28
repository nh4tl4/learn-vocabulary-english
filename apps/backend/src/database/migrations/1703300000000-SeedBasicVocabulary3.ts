import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedBasicVocabulary31703300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO vocabulary (word, meaning, pronunciation, example, level, "partOfSpeech", "createdAt", "updatedAt") VALUES
      -- Occupations/Jobs
      ('doctor', 'bác sĩ', 'ˈdɑːktər', 'The doctor helps sick people.', 'beginner', 'noun', NOW(), NOW()),
      ('nurse', 'y tá', 'nɜːrs', 'The nurse is kind.', 'beginner', 'noun', NOW(), NOW()),
      ('police', 'cảnh sát', 'pəˈliːs', 'Call the police.', 'beginner', 'noun', NOW(), NOW()),
      ('farmer', 'nông dân', 'ˈfɑːrmər', 'The farmer grows rice.', 'beginner', 'noun', NOW(), NOW()),
      ('driver', 'tài xế', 'ˈdraɪvər', 'The bus driver is careful.', 'beginner', 'noun', NOW(), NOW()),
      ('waiter', 'phục vụ bàn', 'ˈweɪtər', 'The waiter brings food.', 'beginner', 'noun', NOW(), NOW()),
      ('lawyer', 'luật sư', 'ˈlɔːjər', 'The lawyer helps people.', 'beginner', 'noun', NOW(), NOW()),
      ('engineer', 'kỹ sư', 'ˌendʒɪˈnɪr', 'The engineer builds bridges.', 'beginner', 'noun', NOW(), NOW()),
      ('artist', 'nghệ sĩ', 'ˈɑːrtɪst', 'The artist paints pictures.', 'beginner', 'noun', NOW(), NOW()),
      ('musician', 'nhạc sĩ', 'mjuˈzɪʃn', 'The musician plays guitar.', 'beginner', 'noun', NOW(), NOW()),
      ('singer', 'ca sĩ', 'ˈsɪŋər', 'The singer has a beautiful voice.', 'beginner', 'noun', NOW(), NOW()),
      ('dancer', 'vũ công', 'ˈdænsər', 'The dancer moves gracefully.', 'beginner', 'noun', NOW(), NOW()),
      ('actor', 'diễn viên', 'ˈæktər', 'The actor is famous.', 'beginner', 'noun', NOW(), NOW()),
      ('writer', 'nhà văn', 'ˈraɪtər', 'The writer wrote a book.', 'beginner', 'noun', NOW(), NOW()),

      -- Places in the City
      ('city', 'thành phố', 'ˈsɪti', 'I live in the city.', 'beginner', 'noun', NOW(), NOW()),
      ('town', 'thị trấn', 'taʊn', 'This is a small town.', 'beginner', 'noun', NOW(), NOW()),
      ('village', 'làng', 'ˈvɪlɪdʒ', 'My grandmother lives in a village.', 'beginner', 'noun', NOW(), NOW()),
      ('street', 'đường phố', 'striːt', 'Cross the street carefully.', 'beginner', 'noun', NOW(), NOW()),
      ('road', 'con đường', 'roʊd', 'The road is long.', 'beginner', 'noun', NOW(), NOW()),
      ('park', 'công viên', 'pɑːrk', 'Children play in the park.', 'beginner', 'noun', NOW(), NOW()),
      ('store', 'cửa hàng', 'stɔːr', 'Buy food at the store.', 'beginner', 'noun', NOW(), NOW()),
      ('market', 'chợ', 'ˈmɑːrkɪt', 'Fresh vegetables at the market.', 'beginner', 'noun', NOW(), NOW()),
      ('bank', 'ngân hàng', 'bæŋk', 'Save money at the bank.', 'beginner', 'noun', NOW(), NOW()),
      ('post office', 'bưu điện', 'poʊst ˈɔːfɪs', 'Send letters at the post office.', 'beginner', 'noun', NOW(), NOW()),
      ('restaurant', 'nhà hàng', 'ˈrestrɑːnt', 'Eat dinner at the restaurant.', 'beginner', 'noun', NOW(), NOW()),
      ('hotel', 'khách sạn', 'hoʊˈtel', 'Stay at the hotel.', 'beginner', 'noun', NOW(), NOW()),
      ('library', 'thư viện', 'ˈlaɪbreri', 'Read books at the library.', 'beginner', 'noun', NOW(), NOW()),
      ('museum', 'bảo tàng', 'mjuˈziəm', 'Visit the museum.', 'beginner', 'noun', NOW(), NOW()),
      ('church', 'nhà thờ', 'tʃɜːrtʃ', 'Pray at the church.', 'beginner', 'noun', NOW(), NOW()),

      -- Nature
      ('tree', 'cây', 'triː', 'The tree is tall.', 'beginner', 'noun', NOW(), NOW()),
      ('flower', 'hoa', 'ˈflaʊər', 'The flower is beautiful.', 'beginner', 'noun', NOW(), NOW()),
      ('grass', 'cỏ', 'ɡræs', 'The grass is green.', 'beginner', 'noun', NOW(), NOW()),
      ('leaf', 'lá', 'liːf', 'The leaf is yellow.', 'beginner', 'noun', NOW(), NOW()),
      ('mountain', 'núi', 'ˈmaʊntən', 'The mountain is high.', 'beginner', 'noun', NOW(), NOW()),
      ('river', 'sông', 'ˈrɪvər', 'Fish swim in the river.', 'beginner', 'noun', NOW(), NOW()),
      ('lake', 'hồ', 'leɪk', 'The lake is calm.', 'beginner', 'noun', NOW(), NOW()),
      ('sea', 'biển', 'siː', 'Swim in the sea.', 'beginner', 'noun', NOW(), NOW()),
      ('ocean', 'đại dương', 'ˈoʊʃn', 'The ocean is vast.', 'beginner', 'noun', NOW(), NOW()),
      ('beach', 'bãi biển', 'biːtʃ', 'Play on the beach.', 'beginner', 'noun', NOW(), NOW()),
      ('forest', 'rừng', 'ˈfɔːrɪst', 'Many animals live in the forest.', 'beginner', 'noun', NOW(), NOW()),
      ('garden', 'vườn', 'ˈɡɑːrdn', 'Grow vegetables in the garden.', 'beginner', 'noun', NOW(), NOW()),
      ('sky', 'bầu trời', 'skaɪ', 'The sky is blue.', 'beginner', 'noun', NOW(), NOW()),
      ('star', 'ngôi sao', 'stɑːr', 'Count the stars.', 'beginner', 'noun', NOW(), NOW()),
      ('moon', 'mặt trăng', 'muːn', 'The moon is bright.', 'beginner', 'noun', NOW(), NOW()),

      -- More Animals
      ('elephant', 'voi', 'ˈelɪfənt', 'The elephant is big.', 'beginner', 'noun', NOW(), NOW()),
      ('lion', 'sư tử', 'ˈlaɪən', 'The lion is strong.', 'beginner', 'noun', NOW(), NOW()),
      ('tiger', 'hổ', 'ˈtaɪɡər', 'The tiger is fierce.', 'beginner', 'noun', NOW(), NOW()),
      ('bear', 'gấu', 'ber', 'The bear is sleeping.', 'beginner', 'noun', NOW(), NOW()),
      ('monkey', 'khỉ', 'ˈmʌŋki', 'The monkey climbs trees.', 'beginner', 'noun', NOW(), NOW()),
      ('wolf', 'sói', 'wʊlf', 'The wolf howls at night.', 'beginner', 'noun', NOW(), NOW()),
      ('fox', 'cáo', 'fɑːks', 'The fox is clever.', 'beginner', 'noun', NOW(), NOW()),
      ('deer', 'hươu', 'dɪr', 'The deer runs fast.', 'beginner', 'noun', NOW(), NOW()),
      ('sheep', 'cừu', 'ʃiːp', 'The sheep gives wool.', 'beginner', 'noun', NOW(), NOW()),
      ('goat', 'dê', 'ɡoʊt', 'The goat eats grass.', 'beginner', 'noun', NOW(), NOW()),
      ('mouse', 'chuột', 'maʊs', 'The mouse is small.', 'beginner', 'noun', NOW(), NOW()),
      ('rat', 'chuột cống', 'ræt', 'The rat lives underground.', 'beginner', 'noun', NOW(), NOW()),
      ('snake', 'rắn', 'sneɪk', 'The snake is long.', 'beginner', 'noun', NOW(), NOW()),
      ('spider', 'nhện', 'ˈspaɪdər', 'The spider makes a web.', 'beginner', 'noun', NOW(), NOW()),
      ('bee', 'ong', 'biː', 'The bee makes honey.', 'beginner', 'noun', NOW(), NOW()),
      ('butterfly', 'bướm', 'ˈbʌtərflaɪ', 'The butterfly is colorful.', 'beginner', 'noun', NOW(), NOW()),

      -- Months of the Year
      ('January', 'tháng một', 'ˈdʒænjueri', 'January is the first month.', 'beginner', 'noun', NOW(), NOW()),
      ('February', 'tháng hai', 'ˈfebrueri', 'February is short.', 'beginner', 'noun', NOW(), NOW()),
      ('March', 'tháng ba', 'mɑːrtʃ', 'Spring starts in March.', 'beginner', 'noun', NOW(), NOW()),
      ('April', 'tháng tư', 'ˈeɪprəl', 'April has rain.', 'beginner', 'noun', NOW(), NOW()),
      ('May', 'tháng năm', 'meɪ', 'May is beautiful.', 'beginner', 'noun', NOW(), NOW()),
      ('June', 'tháng sáu', 'dʒuːn', 'June is warm.', 'beginner', 'noun', NOW(), NOW()),
      ('July', 'tháng bảy', 'dʒuˈlaɪ', 'July is hot.', 'beginner', 'noun', NOW(), NOW()),
      ('August', 'tháng tám', 'ˈɔːɡəst', 'August is vacation time.', 'beginner', 'noun', NOW(), NOW()),
      ('September', 'tháng chín', 'sepˈtembər', 'School starts in September.', 'beginner', 'noun', NOW(), NOW()),
      ('October', 'tháng mười', 'ɑːkˈtoʊbər', 'October has autumn leaves.', 'beginner', 'noun', NOW(), NOW()),
      ('November', 'tháng mười một', 'noʊˈvembər', 'November is cool.', 'beginner', 'noun', NOW(), NOW()),
      ('December', 'tháng mười hai', 'dɪˈsembər', 'December has Christmas.', 'beginner', 'noun', NOW(), NOW()),

      -- Seasons
      ('spring', 'mùa xuân', 'sprɪŋ', 'Flowers bloom in spring.', 'beginner', 'noun', NOW(), NOW()),
      ('summer', 'mùa hè', 'ˈsʌmər', 'Summer is hot.', 'beginner', 'noun', NOW(), NOW()),
      ('autumn', 'mùa thu', 'ˈɔːtəm', 'Leaves fall in autumn.', 'beginner', 'noun', NOW(), NOW()),
      ('winter', 'mùa đông', 'ˈwɪntər', 'Winter is cold.', 'beginner', 'noun', NOW(), NOW()),

      -- Basic Prepositions
      ('in', 'trong', 'ɪn', 'The book is in the bag.', 'beginner', 'preposition', NOW(), NOW()),
      ('on', 'trên', 'ɑːn', 'The cat is on the table.', 'beginner', 'preposition', NOW(), NOW()),
      ('under', 'dưới', 'ˈʌndər', 'The dog is under the table.', 'beginner', 'preposition', NOW(), NOW()),
      ('over', 'trên', 'ˈoʊvər', 'The bird flies over the house.', 'beginner', 'preposition', NOW(), NOW()),
      ('near', 'gần', 'nɪr', 'The school is near my house.', 'beginner', 'preposition', NOW(), NOW()),
      ('far', 'xa', 'fɑːr', 'The store is far from here.', 'beginner', 'adjective', NOW(), NOW()),
      ('between', 'giữa', 'bɪˈtwiːn', 'Sit between John and Mary.', 'beginner', 'preposition', NOW(), NOW()),
      ('behind', 'đằng sau', 'bɪˈhaɪnd', 'Hide behind the tree.', 'beginner', 'preposition', NOW(), NOW()),
      ('front', 'phía trước', 'frʌnt', 'Stand in front of the class.', 'beginner', 'noun', NOW(), NOW()),
      ('next to', 'bên cạnh', 'nekst tuː', 'Sit next to me.', 'beginner', 'preposition', NOW(), NOW()),

      -- Common Adjectives
      ('nice', 'tốt đẹp', 'naɪs', 'She is a nice person.', 'beginner', 'adjective', NOW(), NOW()),
      ('kind', 'tử tế', 'kaɪnd', 'He is very kind.', 'beginner', 'adjective', NOW(), NOW()),
      ('smart', 'thông minh', 'smɑːrt', 'The student is smart.', 'beginner', 'adjective', NOW(), NOW()),
      ('funny', 'vui nhộn', 'ˈfʌni', 'The clown is funny.', 'beginner', 'adjective', NOW(), NOW()),
      ('busy', 'bận rộn', 'ˈbɪzi', 'I am busy today.', 'beginner', 'adjective', NOW(), NOW()),
      ('free', 'rảnh rỗi', 'friː', 'I am free this evening.', 'beginner', 'adjective', NOW(), NOW()),
      ('tired', 'mệt mỏi', 'ˈtaɪərd', 'I am tired after work.', 'beginner', 'adjective', NOW(), NOW()),
      ('hungry', 'đói', 'ˈhʌŋɡri', 'I am hungry.', 'beginner', 'adjective', NOW(), NOW()),
      ('thirsty', 'khát', 'ˈθɜːrsti', 'I am thirsty.', 'beginner', 'adjective', NOW(), NOW()),
      ('sick', 'ốm', 'sɪk', 'She is sick today.', 'beginner', 'adjective', NOW(), NOW()),
      ('healthy', 'khỏe mạnh', 'ˈhelθi', 'Exercise keeps you healthy.', 'beginner', 'adjective', NOW(), NOW()),
      ('careful', 'cẩn thận', 'ˈkerfəl', 'Be careful crossing the street.', 'beginner', 'adjective', NOW(), NOW()),
      ('dangerous', 'nguy hiểm', 'ˈdeɪndʒərəs', 'Fire is dangerous.', 'beginner', 'adjective', NOW(), NOW()),
      ('safe', 'an toàn', 'seɪf', 'This place is safe.', 'beginner', 'adjective', NOW(), NOW()),
      ('quiet', 'yên tĩnh', 'ˈkwaɪət', 'The library is quiet.', 'beginner', 'adjective', NOW(), NOW()),
      ('loud', 'to tiếng', 'laʊd', 'The music is too loud.', 'beginner', 'adjective', NOW(), NOW()),
      ('bright', 'sáng', 'braɪt', 'The sun is bright.', 'beginner', 'adjective', NOW(), NOW()),
      ('dark', 'tối', 'dɑːrk', 'The room is dark.', 'beginner', 'adjective', NOW(), NOW()),
      ('light', 'nhẹ', 'laɪt', 'The bag is light.', 'beginner', 'adjective', NOW(), NOW()),
      ('heavy', 'nặng', 'ˈhevi', 'The box is heavy.', 'beginner', 'adjective', NOW(), NOW())
      ON CONFLICT (word) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM vocabulary WHERE word IN ('doctor', 'nurse', 'police', 'farmer', 'driver')`);
  }
}
