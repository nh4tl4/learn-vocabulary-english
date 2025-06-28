import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedVocabulary1703000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert vocabulary data with ON CONFLICT DO NOTHING to prevent duplicates
    await queryRunner.query(`
      INSERT INTO vocabulary (word, meaning, pronunciation, example, level, "partOfSpeech", "createdAt", "updatedAt") VALUES
      -- Beginner Level
      ('hello', 'chào, xin chào', 'həˈloʊ', 'Hello, how are you today?', 'beginner', 'exclamation', NOW(), NOW()),
      ('goodbye', 'tạm biệt', 'ɡʊdˈbaɪ', 'Goodbye, see you tomorrow!', 'beginner', 'exclamation', NOW(), NOW()),
      ('thank you', 'cảm ơn', 'θæŋk juː', 'Thank you for your help.', 'beginner', 'phrase', NOW(), NOW()),
      ('please', 'xin vui lòng', 'pliːz', 'Please help me with this.', 'beginner', 'adverb', NOW(), NOW()),
      ('yes', 'có, vâng', 'jes', 'Yes, I agree with you.', 'beginner', 'adverb', NOW(), NOW()),
      ('no', 'không', 'noʊ', 'No, I cannot do that.', 'beginner', 'adverb', NOW(), NOW()),
      ('water', 'nước', 'ˈwɔːtər', 'I need a glass of water.', 'beginner', 'noun', NOW(), NOW()),
      ('food', 'thức ăn', 'fuːd', 'The food is delicious.', 'beginner', 'noun', NOW(), NOW()),
      ('house', 'nhà', 'haʊs', 'I live in a big house.', 'beginner', 'noun', NOW(), NOW()),
      ('car', 'xe hơi', 'kɑːr', 'My car is red.', 'beginner', 'noun', NOW(), NOW()),
      ('book', 'sách', 'bʊk', 'I am reading a good book.', 'beginner', 'noun', NOW(), NOW()),
      ('school', 'trường học', 'skuːl', 'Children go to school every day.', 'beginner', 'noun', NOW(), NOW()),
      ('work', 'công việc, làm việc', 'wɜːrk', 'I work in an office.', 'beginner', 'noun', NOW(), NOW()),
      ('family', 'gia đình', 'ˈfæməli', 'I love my family very much.', 'beginner', 'noun', NOW(), NOW()),
      ('friend', 'bạn bè', 'frend', 'She is my best friend.', 'beginner', 'noun', NOW(), NOW()),
      ('happy', 'vui vẻ, hạnh phúc', 'ˈhæpi', 'I am happy to see you.', 'beginner', 'adjective', NOW(), NOW()),
      ('sad', 'buồn', 'sæd', 'Why are you so sad today?', 'beginner', 'adjective', NOW(), NOW()),
      ('big', 'to, lớn', 'bɪɡ', 'This is a big house.', 'beginner', 'adjective', NOW(), NOW()),
      ('small', 'nhỏ', 'smɔːl', 'The cat is very small.', 'beginner', 'adjective', NOW(), NOW()),
      ('good', 'tốt', 'ɡʊd', 'This is a good idea.', 'beginner', 'adjective', NOW(), NOW()),
      
      -- Intermediate Level
      ('achievement', 'thành tựu', 'əˈtʃiːvmənt', 'Winning the competition was a great achievement.', 'intermediate', 'noun', NOW(), NOW()),
      ('environment', 'môi trường', 'ɪnˈvaɪrənmənt', 'We must protect our environment.', 'intermediate', 'noun', NOW(), NOW()),
      ('opportunity', 'cơ hội', 'ˌɑːpərˈtuːnəti', 'This job is a great opportunity for me.', 'intermediate', 'noun', NOW(), NOW()),
      ('experience', 'kinh nghiệm', 'ɪkˈspɪriəns', 'I have five years of experience in teaching.', 'intermediate', 'noun', NOW(), NOW()),
      ('knowledge', 'kiến thức', 'ˈnɑːlɪdʒ', 'Knowledge is power.', 'intermediate', 'noun', NOW(), NOW()),
      ('responsibility', 'trách nhiệm', 'rɪˌspɑːnsəˈbɪləti', 'It is our responsibility to help others.', 'intermediate', 'noun', NOW(), NOW()),
      ('development', 'sự phát triển', 'dɪˈveləpmənt', 'The development of technology is amazing.', 'intermediate', 'noun', NOW(), NOW()),
      ('communication', 'giao tiếp', 'kəˌmjuːnɪˈkeɪʃn', 'Good communication is essential in business.', 'intermediate', 'noun', NOW(), NOW()),
      ('understand', 'hiểu', 'ˌʌndərˈstænd', 'I understand what you mean.', 'intermediate', 'verb', NOW(), NOW()),
      ('improve', 'cải thiện', 'ɪmˈpruːv', 'I want to improve my English skills.', 'intermediate', 'verb', NOW(), NOW()),
      ('create', 'tạo ra', 'kriˈeɪt', 'Artists create beautiful paintings.', 'intermediate', 'verb', NOW(), NOW()),
      ('discover', 'khám phá', 'dɪˈskʌvər', 'Scientists discover new things every day.', 'intermediate', 'verb', NOW(), NOW()),
      ('organize', 'tổ chức', 'ˈɔːrɡənaɪz', 'We need to organize the event carefully.', 'intermediate', 'verb', NOW(), NOW()),
      ('successful', 'thành công', 'səkˈsesfl', 'She is a successful businesswoman.', 'intermediate', 'adjective', NOW(), NOW()),
      ('important', 'quan trọng', 'ɪmˈpɔːrtnt', 'Education is very important for children.', 'intermediate', 'adjective', NOW(), NOW()),
      ('necessary', 'cần thiết', 'ˈnesəseri', 'It is necessary to study hard.', 'intermediate', 'adjective', NOW(), NOW()),
      ('interesting', 'thú vị', 'ˈɪntrəstɪŋ', 'This book is very interesting.', 'intermediate', 'adjective', NOW(), NOW()),
      ('difficult', 'khó', 'ˈdɪfɪkəlt', 'Learning a new language is difficult.', 'intermediate', 'adjective', NOW(), NOW()),
      ('comfortable', 'thoải mái', 'ˈkʌmftəbl', 'This chair is very comfortable.', 'intermediate', 'adjective', NOW(), NOW()),
      ('popular', 'phổ biến', 'ˈpɑːpjələr', 'This song is very popular among young people.', 'intermediate', 'adjective', NOW(), NOW()),
      
      -- Advanced Level
      ('sophisticated', 'tinh vi, phức tạp', 'səˈfɪstɪkeɪtɪd', 'The new software has a sophisticated design.', 'advanced', 'adjective', NOW(), NOW()),
      ('unprecedented', 'chưa từng có', 'ʌnˈpresɪdentɪd', 'The company achieved unprecedented success.', 'advanced', 'adjective', NOW(), NOW()),
      ('comprehensive', 'toàn diện', 'ˌkɑːmprɪˈhensɪv', 'We need a comprehensive solution to this problem.', 'advanced', 'adjective', NOW(), NOW()),
      ('fundamental', 'cơ bản', 'ˌfʌndəˈmentl', 'Reading is a fundamental skill for learning.', 'advanced', 'adjective', NOW(), NOW()),
      ('substantial', 'đáng kể', 'səbˈstænʃl', 'There has been substantial progress in the project.', 'advanced', 'adjective', NOW(), NOW()),
      ('phenomenon', 'hiện tượng', 'fəˈnɑːmɪnɑːn', 'Global warming is a serious phenomenon.', 'advanced', 'noun', NOW(), NOW()),
      ('methodology', 'phương pháp luận', 'ˌmeθəˈdɑːlədʒi', 'The research methodology was very thorough.', 'advanced', 'noun', NOW(), NOW()),
      ('hypothesis', 'giả thuyết', 'haɪˈpɑːθəsɪs', 'The scientist tested his hypothesis carefully.', 'advanced', 'noun', NOW(), NOW()),
      ('implementation', 'sự thực hiện', 'ˌɪmplɪmenˈteɪʃn', 'The implementation of the new policy was successful.', 'advanced', 'noun', NOW(), NOW()),
      ('infrastructure', 'cơ sở hạ tầng', 'ˈɪnfrəstrʌktʃər', 'The country needs to improve its infrastructure.', 'advanced', 'noun', NOW(), NOW()),
      ('demonstrate', 'chứng minh', 'ˈdemənstreɪt', 'The results demonstrate the effectiveness of the method.', 'advanced', 'verb', NOW(), NOW()),
      ('establish', 'thành lập', 'ɪˈstæblɪʃ', 'They established the company in 1990.', 'advanced', 'verb', NOW(), NOW()),
      ('contribute', 'đóng góp', 'kənˈtrɪbjuːt', 'Everyone should contribute to society.', 'advanced', 'verb', NOW(), NOW()),
      ('investigate', 'điều tra', 'ɪnˈvestɪɡeɪt', 'The police will investigate the crime.', 'advanced', 'verb', NOW(), NOW()),
      ('collaborate', 'hợp tác', 'kəˈlæbəreɪt', 'We need to collaborate to solve this problem.', 'advanced', 'verb', NOW(), NOW()),
      ('furthermore', 'hơn nữa', 'ˌfɜːrðərˈmɔːr', 'The project is expensive. Furthermore, it is risky.', 'advanced', 'adverb', NOW(), NOW()),
      ('nevertheless', 'tuy nhiên', 'ˌnevərðəˈles', 'The task was difficult; nevertheless, we completed it.', 'advanced', 'adverb', NOW(), NOW()),
      ('consequently', 'do đó', 'ˈkɑːnsəkwəntli', 'It rained heavily; consequently, the match was cancelled.', 'advanced', 'adverb', NOW(), NOW()),
      ('simultaneously', 'đồng thời', 'ˌsaɪmlˈteɪniəsli', 'They worked on multiple projects simultaneously.', 'advanced', 'adverb', NOW(), NOW()),
      ('ultimately', 'cuối cùng', 'ˈʌltɪmətli', 'Ultimately, hard work leads to success.', 'advanced', 'adverb', NOW(), NOW()),
      
      -- Business/Technology
      ('innovation', 'sự đổi mới', 'ˌɪnəˈveɪʃn', 'Innovation is key to business success.', 'intermediate', 'noun', NOW(), NOW()),
      ('strategy', 'chiến lược', 'ˈstrætədʒi', 'We need a new marketing strategy.', 'intermediate', 'noun', NOW(), NOW()),
      ('efficiency', 'hiệu quả', 'ɪˈfɪʃnsi', 'We must improve the efficiency of our operations.', 'intermediate', 'noun', NOW(), NOW()),
      ('productivity', 'năng suất', 'ˌproʊdʌkˈtɪvəti', 'Technology can increase productivity.', 'intermediate', 'noun', NOW(), NOW()),
      ('management', 'quản lý', 'ˈmænɪdʒmənt', 'Good management is essential for success.', 'intermediate', 'noun', NOW(), NOW()),
      ('technology', 'công nghệ', 'tekˈnɑːlədʒi', 'Technology changes our lives.', 'intermediate', 'noun', NOW(), NOW()),
      ('digital', 'kỹ thuật số', 'ˈdɪdʒɪtl', 'We live in a digital age.', 'intermediate', 'adjective', NOW(), NOW()),
      ('analyze', 'phân tích', 'ˈænəlaɪz', 'We need to analyze the data carefully.', 'intermediate', 'verb', NOW(), NOW()),
      ('optimize', 'tối ưu hóa', 'ˈɑːptɪmaɪz', 'We should optimize our website for search engines.', 'advanced', 'verb', NOW(), NOW()),
      ('implement', 'thực hiện', 'ˈɪmplɪment', 'We will implement the new system next month.', 'intermediate', 'verb', NOW(), NOW()),
      
      -- Daily Life
      ('breakfast', 'bữa sáng', 'ˈbrekfəst', 'I always eat breakfast before work.', 'beginner', 'noun', NOW(), NOW()),
      ('lunch', 'bữa trưa', 'lʌntʃ', 'What did you have for lunch?', 'beginner', 'noun', NOW(), NOW()),
      ('dinner', 'bữa tối', 'ˈdɪnər', 'We usually have dinner at 7 PM.', 'beginner', 'noun', NOW(), NOW()),
      ('weather', 'thời tiết', 'ˈweðər', 'The weather is nice today.', 'beginner', 'noun', NOW(), NOW()),
      ('clothes', 'quần áo', 'kloʊðz', 'I need to buy new clothes.', 'beginner', 'noun', NOW(), NOW()),
      ('exercise', 'tập thể dục', 'ˈeksərsaɪz', 'Exercise is good for your health.', 'beginner', 'noun', NOW(), NOW()),
      ('hospital', 'bệnh viện', 'ˈhɑːspɪtl', 'She works at the local hospital.', 'beginner', 'noun', NOW(), NOW()),
      ('shopping', 'mua sắm', 'ˈʃɑːpɪŋ', 'I enjoy shopping on weekends.', 'beginner', 'noun', NOW(), NOW()),
      ('vacation', 'kỳ nghỉ', 'veɪˈkeɪʃn', 'We are planning a vacation to Europe.', 'intermediate', 'noun', NOW(), NOW()),
      ('travel', 'du lịch', 'ˈtrævl', 'I love to travel and see new places.', 'beginner', 'verb', NOW(), NOW()),
      
      -- Emotions and Feelings
      ('excited', 'phấn khích', 'ɪkˈsaɪtɪd', 'I am excited about the new job.', 'beginner', 'adjective', NOW(), NOW()),
      ('nervous', 'lo lắng', 'ˈnɜːrvəs', 'She feels nervous before the exam.', 'beginner', 'adjective', NOW(), NOW()),
      ('confident', 'tự tin', 'ˈkɑːnfɪdənt', 'He is confident in his abilities.', 'intermediate', 'adjective', NOW(), NOW()),
      ('curious', 'tò mò', 'ˈkjʊriəs', 'Children are naturally curious about the world.', 'intermediate', 'adjective', NOW(), NOW()),
      ('disappointed', 'thất vọng', 'ˌdɪsəˈpɔɪntɪd', 'I was disappointed with the results.', 'intermediate', 'adjective', NOW(), NOW()),
      ('grateful', 'biết ơn', 'ˈɡreɪtfl', 'I am grateful for your help.', 'intermediate', 'adjective', NOW(), NOW()),
      ('surprised', 'ngạc nhiên', 'sərˈpraɪzd', 'I was surprised by the news.', 'beginner', 'adjective', NOW(), NOW()),
      ('worried', 'lo lắng', 'ˈwɜːrid', 'She is worried about her son.', 'beginner', 'adjective', NOW(), NOW()),
      ('proud', 'tự hào', 'praʊd', 'Parents are proud of their children.', 'beginner', 'adjective', NOW(), NOW()),
      ('confused', 'bối rối', 'kənˈfjuːzd', 'I am confused about the instructions.', 'beginner', 'adjective', NOW(), NOW())
      ON CONFLICT (word) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM vocabulary`);
  }
}
