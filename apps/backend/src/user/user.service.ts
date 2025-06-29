import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { UserVocabulary, LearningStatus } from '../database/entities/user-vocabulary.entity';
import { UserTopicHistory } from '../database/entities/user-topic-history.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserVocabulary)
    private userVocabularyRepository: Repository<UserVocabulary>,
    @InjectRepository(UserTopicHistory)
    private userTopicHistoryRepository: Repository<UserTopicHistory>,
  ) {}

  async findOne(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async getUserStats(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    // Get vocabulary statistics
    const totalWords = await this.userVocabularyRepository.count({
      where: { userId },
    });

    const masteredWords = await this.userVocabularyRepository.count({
      where: { userId, status: LearningStatus.MASTERED },
    });

    const reviewWords = await this.userVocabularyRepository.count({
      where: { userId, status: LearningStatus.REVIEWING },
    });

    const difficultWords = await this.userVocabularyRepository.count({
      where: { userId, status: LearningStatus.DIFFICULT },
    });

    // Calculate accuracy
    const vocabularyStats = await this.userVocabularyRepository
      .createQueryBuilder('uv')
      .select('SUM(uv.correctCount)', 'totalCorrect')
      .addSelect('SUM(uv.incorrectCount)', 'totalIncorrect')
      .where('uv.userId = :userId', { userId })
      .getRawOne();

    const totalAttempts = (vocabularyStats.totalCorrect || 0) + (vocabularyStats.totalIncorrect || 0);
    const accuracy = totalAttempts > 0 ? Math.round((vocabularyStats.totalCorrect / totalAttempts) * 100) : 0;

    return {
      user: {
        name: user.name,
        email: user.email,
        dailyGoal: user.dailyGoal,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        totalWordsLearned: user.totalWordsLearned,
        totalTestsTaken: user.totalTestsTaken,
        averageTestScore: user.averageTestScore,
      },
      vocabulary: {
        totalWords,
        masteredWords,
        reviewWords,
        difficultWords,
        accuracy,
      },
    };
  }

  async updateProfile(userId: number, updateData: { name?: string }) {
    await this.userRepository.update(userId, updateData);
    return this.findOne(userId);
  }

  async setDailyGoal(userId: number, dailyGoal: number) {
    await this.userRepository.update(userId, { dailyGoal });
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
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['selectedTopics'],
    });

    return {
      topics: user?.selectedTopics ? JSON.parse(user.selectedTopics) : [],
    };
  }

  // Lưu danh sách chủ đề đã chọn của user
  async saveSelectedTopics(userId: number, topics: string[]) {
    await this.userRepository.update(userId, {
      selectedTopics: JSON.stringify(topics),
    });
  }
}
