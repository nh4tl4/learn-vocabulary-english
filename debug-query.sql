-- Debug queries để kiểm tra cấu trúc database và dữ liệu

-- 1. Kiểm tra cấu trúc bảng user_vocabulary
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_vocabulary'
ORDER BY ordinal_position;

-- 2. Kiểm tra dữ liệu mẫu trong user_vocabulary
SELECT * FROM user_vocabulary LIMIT 5;

-- 3. Test query tương tự như trong code để tìm learned words
SELECT uv."vocabularyId" as vocabularyId
FROM user_vocabulary uv
WHERE uv."userId" = 1;

-- 4. Test query với alias để xem format trả về
SELECT uv."vocabularyId" as uv_vocabularyId
FROM user_vocabulary uv
WHERE uv."userId" = 1;

-- 5. Kiểm tra vocabulary table với topicId
SELECT v.id, v.word, v."topicId", v.level
FROM vocabulary v
WHERE v."topicId" = 1
AND v.level = 'beginner'
LIMIT 5;

-- 6. Test query NOT EXISTS như trong code
SELECT v.id, v.word, v.meaning
FROM vocabulary v
WHERE v."topicId" = 1
AND v.level = 'beginner'
AND NOT EXISTS (
    SELECT 1 FROM user_vocabulary uv
    WHERE uv."vocabularyId" = v.id
    AND uv."userId" = 1
)
LIMIT 10;
