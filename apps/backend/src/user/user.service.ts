import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { UserVocabulary, LearningStatus } from '../database/entities/user-vocabulary.entity';
import { UserTopicHistory } from '../database/entities/user-topic-history.entity';
import { UserSelectedTopic } from '../database/entities/user-selected-topic.entity';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserVocabulary)
    private userVocabularyRepository: Repository<UserVocabulary>,
    @InjectRepository(UserTopicHistory)
    private userTopicHistoryRepository: Repository<UserTopicHistory>,
    @InjectRepository(UserSelectedTopic)
    private userSelectedTopicRepository: Repository<UserSelectedTopic>,
    private redisService: RedisService,
  ) {}

  // Optimized findOne with caching
  async findOne(id: number): Promise<User> {
    // Try cache first
    const cacheKey = `user_profile_${id}`;

    try {
      const cached = await this.redisService.get(cacheKey);

      if (cached) {
        // Check if cached data is already an object or needs parsing
        if (typeof cached === 'string') {
          return JSON.parse(cached);
        } else if (typeof cached === 'object') {
          return cached as User;
        }
      }
    } catch (error) {
      console.warn(`Failed to get cached user profile for ${id}:`, error.message);
      // Continue to fetch from database if cache fails
    }

    // Get from database with only necessary fields
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id', 'name', 'email', 'level', 'dailyGoal',
        'currentStreak', 'longestStreak', 'totalWordsLearned',
        'totalTestsTaken', 'averageTestScore', 'createdAt'
      ]
    });

    if (user) {
      // Cache for 10 minutes
      try {
        await this.redisService.set(cacheKey, JSON.stringify(user), 600);
      } catch (error) {
        console.warn(`Failed to cache user profile for ${id}:`, error.message);
      }
    }

    return user;
  }

  // Heavily optimized getUserStats with caching and single query
  async getUserStats(userId: number) {
    const cacheKey = `user_stats_${userId}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Single optimized query to get all vocabulary stats
    const [user, vocabularyStats] = await Promise.all([
      this.findOne(userId), // This will use cache if available

      // Single query to get all vocabulary stats at once
      this.userVocabularyRepository
        .createQueryBuilder('uv')
        .select([
          'COUNT(*) as totalWords',
          'SUM(CASE WHEN uv.status = :mastered THEN 1 ELSE 0 END) as masteredWords',
          'SUM(CASE WHEN uv.status = :reviewing THEN 1 ELSE 0 END) as reviewWords',
          'SUM(CASE WHEN uv.status = :difficult THEN 1 ELSE 0 END) as difficultWords',
          'SUM(COALESCE(uv.correctCount, 0)) as totalCorrect',
          'SUM(COALESCE(uv.incorrectCount, 0)) as totalIncorrect'
        ])
        .where('uv.userId = :userId', { userId })
        .setParameters({
          mastered: LearningStatus.MASTERED,
          reviewing: LearningStatus.REVIEWING,
          difficult: LearningStatus.DIFFICULT
        })
        .getRawOne()
    ]);

    // Calculate accuracy
    const totalAttempts = (vocabularyStats.totalCorrect || 0) + (vocabularyStats.totalIncorrect || 0);
    const accuracy = totalAttempts > 0 ? Math.round((vocabularyStats.totalCorrect / totalAttempts) * 100) : 0;

    const result = {
      user: {
        name: user?.name,
        email: user?.email,
        level: user?.level,
        dailyGoal: user?.dailyGoal || 10,
        currentStreak: user?.currentStreak || 0,
        longestStreak: user?.longestStreak || 0,
        totalWordsLearned: user?.totalWordsLearned || 0,
        totalTestsTaken: user?.totalTestsTaken || 0,
        averageTestScore: user?.averageTestScore || 0,
      },
      vocabulary: {
        totalWords: parseInt(vocabularyStats.totalWords) || 0,
        masteredWords: parseInt(vocabularyStats.masteredWords) || 0,
        reviewWords: parseInt(vocabularyStats.reviewWords) || 0,
        difficultWords: parseInt(vocabularyStats.difficultWords) || 0,
        accuracy,
      },
    };

    // Cache for 5 minutes
    await this.redisService.set(cacheKey, JSON.stringify(result), 300);

    return result;
  }

  // Optimized updateProfile with cache invalidation
  async updateProfile(userId: number, updateData: { name?: string }) {
    await this.userRepository.update(userId, updateData);

    // Clear cache to ensure fresh data
    await this.redisService.delete(`user_profile_${userId}`);
    await this.redisService.delete(`user_stats_${userId}`);

    return this.findOne(userId);
  }

  // Optimized setDailyGoal with cache invalidation
  async setDailyGoal(userId: number, dailyGoal: number) {
    await this.userRepository.update(userId, { dailyGoal });

    // Clear cache to ensure fresh data
    await this.redisService.delete(`user_profile_${userId}`);
    await this.redisService.delete(`user_stats_${userId}`);

    return this.findOne(userId);
  }

  // Lưu chủ đề user đã chọn
  async saveTopicSelection(userId: number, topic: string | null) {
    const existingRecord = await this.userTopicHistoryRepository.findOne({
      where: { userId, topic },
    });

    if (existingRecord) {
      // Cập nhật số lần chọn và thời gian cuối
      await this.userTopicHistoryRepository.update(existingRecord.id, {
        sessionCount: existingRecord.sessionCount + 1,
        lastSelectedAt: new Date(),
      });
    } else {
      // Tạo record mới
      await this.userTopicHistoryRepository.save({
        userId,
        topic,
        sessionCount: 1,
        wordsLearned: 0,
        lastSelectedAt: new Date(),
      });
    }
  }

  // Lấy danh sách chủ đề user đã chọn (sắp xếp theo tần suất)
  async getUserTopicHistory(userId: number) {
    return this.userTopicHistoryRepository.find({
      where: { userId },
      order: {
        sessionCount: 'DESC', // Chủ đề chọn nhiều nhất trước
        lastSelectedAt: 'DESC', // Nếu bằng nhau thì theo thời gian gần nhất
      },
    });
  }

  // Lấy chủ đề được chọn gần đây nhất
  async getLastSelectedTopic(userId: number) {
    return this.userTopicHistoryRepository.findOne({
      where: { userId },
      order: { lastSelectedAt: 'DESC' },
    });
  }

  // Cập nhật số từ đã học trong chủ đề
  async updateTopicWordsLearned(userId: number, topic: string | null, wordsCount: number) {
    const record = await this.userTopicHistoryRepository.findOne({
      where: { userId, topic },
    });

    if (record) {
      await this.userTopicHistoryRepository.update(record.id, {
        wordsLearned: record.wordsLearned + wordsCount,
      });
    }
  }

  // Lấy danh sách chủ đề đã chọn của user
  async getSelectedTopics(userId: number) {
    // Try cache first
    const cached = await this.redisService.getUserSelectedTopics(userId);
    if (cached && cached.length > 0) {
      return { topics: cached };
    }


    const selectedTopics = await this.userSelectedTopicRepository.find({
      where: { userId },
      order: { selectedAt: 'DESC' }
    });

    const topics = selectedTopics.map(st => st.topic);

    // Cache for 30 minutes
    await this.redisService.setUserSelectedTopics(userId, topics, 1800);

    return { topics };
  }

  // Lưu danh sách chủ đề đã chọn của user
  async saveSelectedTopics(userId: number, topics: string[]) {
    // Xóa tất cả chủ đề đã chọn cũ của user
    await this.userSelectedTopicRepository.delete({ userId });

    // Thêm các chủ đề mới
    if (topics.length > 0) {
      const selectedTopics = topics.map(topic => ({
        userId,
        topic,
        selectedAt: new Date()
      }));

      await this.userSelectedTopicRepository.save(selectedTopics);
    }

    // Clear cache and update with new data
    await this.redisService.clearUserSelectedTopics(userId);
    await this.redisService.setUserSelectedTopics(userId, topics, 1800);
  }
}
