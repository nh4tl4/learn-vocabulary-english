import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { UserVocabulary } from '../database/entities/user-vocabulary.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserVocabulary)
    private userVocabularyRepository: Repository<UserVocabulary>,
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
      where: { userId, status: 'mastered' },
    });

    const reviewWords = await this.userVocabularyRepository.count({
      where: { userId, status: 'reviewing' },
    });

    const difficultWords = await this.userVocabularyRepository.count({
      where: { userId, status: 'difficult' },
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
}
