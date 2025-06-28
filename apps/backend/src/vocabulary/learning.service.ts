import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, Between } from 'typeorm';
import { UserVocabulary, LearningStatus } from '../database/entities/user-vocabulary.entity';
import { User } from '../database/entities/user.entity';
import { Vocabulary } from '../database/entities/vocabulary.entity';
import { StudySessionDto, ReviewFilterDto } from './dto/learning.dto';

@Injectable()
export class LearningService {
  constructor(
    @InjectRepository(UserVocabulary)
    private userVocabularyRepository: Repository<UserVocabulary>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Vocabulary)
    private vocabularyRepository: Repository<Vocabulary>,
  ) {}

  // Get today's learning progress for user
  async getTodayProgress(userId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayLearned = await this.userVocabularyRepository.count({
      where: {
        userId,
        firstLearnedDate: Between(today, tomorrow),
      },
    });

    const todayReviewed = await this.userVocabularyRepository.count({
      where: {
        userId,
        lastReviewedAt: Between(today, tomorrow),
      },
    });

    return {
      wordsLearned: todayLearned,
      wordsReviewed: todayReviewed,
      totalProgress: todayLearned + todayReviewed,
    };
  }

  // Get words that need review today
  async getWordsForReview(userId: number, limit: number = 20) {
    const now = new Date();

    return await this.userVocabularyRepository.find({
      where: {
        userId,
        nextReviewDate: LessThan(now),
        status: LearningStatus.LEARNING,
      },
      relations: ['vocabulary'],
      take: limit,
      order: { nextReviewDate: 'ASC' },
    });
  }

  // Get new words for learning
  async getNewWordsForLearning(userId: number, limit: number = 10) {
    // Get words user hasn't learned yet
    const learnedWordIds = await this.userVocabularyRepository
      .createQueryBuilder('uv')
      .select('uv.vocabularyId')
      .where('uv.userId = :userId', { userId })
      .getRawMany();

    const learnedIds = learnedWordIds.map(item => item.uv_vocabularyId);

    const queryBuilder = this.vocabularyRepository
      .createQueryBuilder('v')
      .take(limit)
      .orderBy('RANDOM()');

    if (learnedIds.length > 0) {
      queryBuilder.where('v.id NOT IN (:...learnedIds)', { learnedIds });
    }

    return await queryBuilder.getMany();
  }

  // Process study session
  async processStudySession(userId: number, sessionData: StudySessionDto) {
    const { vocabularyId, quality, responseTime } = sessionData;

    let userVocab = await this.userVocabularyRepository.findOne({
      where: { userId, vocabularyId },
    });

    if (!userVocab) {
      // First time learning this word
      userVocab = this.userVocabularyRepository.create({
        userId,
        vocabularyId,
        status: LearningStatus.LEARNING,
        correctCount: quality >= 3 ? 1 : 0,
        incorrectCount: quality < 3 ? 1 : 0,
        firstLearnedDate: new Date(),
        lastReviewedAt: new Date(),
        nextReviewDate: this.calculateNextReviewDate(quality, 0),
      });
    } else {
      // Update existing record
      if (quality >= 3) {
        userVocab.correctCount++;
      } else {
        userVocab.incorrectCount++;
      }

      userVocab.lastReviewedAt = new Date();
      userVocab.nextReviewDate = this.calculateNextReviewDate(quality, userVocab.correctCount);

      // Update status based on performance
      if (userVocab.correctCount >= 5 && userVocab.incorrectCount === 0) {
        userVocab.status = LearningStatus.MASTERED;
      } else if (userVocab.incorrectCount > userVocab.correctCount) {
        userVocab.status = LearningStatus.DIFFICULT;
      }
    }

    await this.userVocabularyRepository.save(userVocab);
    return userVocab;
  }

  // Generate test questions
  async generateTest(userId: number, count: number = 10) {
    // Get learned words for test
    const learnedWords = await this.userVocabularyRepository.find({
      where: { userId },
      relations: ['vocabulary'],
      take: count,
      order: { lastReviewedAt: 'DESC' },
    });

    const testQuestions = [];

    for (const userVocab of learnedWords) {
      const word = userVocab.vocabulary;

      // Get 3 random wrong answers
      const wrongAnswers = await this.vocabularyRepository
        .createQueryBuilder('v')
        .where('v.id != :correctId', { correctId: word.id })
        .orderBy('RANDOM()')
        .take(3)
        .getMany();

      const options = [
        { id: 1, text: word.meaning, isCorrect: true },
        { id: 2, text: wrongAnswers[0]?.meaning || 'Đáp án sai 1', isCorrect: false },
        { id: 3, text: wrongAnswers[1]?.meaning || 'Đáp án sai 2', isCorrect: false },
        { id: 4, text: wrongAnswers[2]?.meaning || 'Đáp án sai 3', isCorrect: false },
      ].sort(() => Math.random() - 0.5); // Shuffle options

      testQuestions.push({
        vocabularyId: word.id,
        question: `Nghĩa của từ "${word.word}" là gì?`,
        options,
        correctAnswerId: options.find(opt => opt.isCorrect)?.id,
      });
    }

    return testQuestions;
  }

  // Submit test results
  async submitTestResults(userId: number, testResults: any[]) {
    let correctAnswers = 0;

    for (const result of testResults) {
      const isCorrect = result.selectedOptionId === result.correctOptionId;
      if (isCorrect) correctAnswers++;

      // Update vocabulary stats based on test performance
      await this.processStudySession(userId, {
        vocabularyId: result.vocabularyId,
        quality: isCorrect ? 4 : 2,
        responseTime: result.timeSpent,
      });
    }

    return {
      totalQuestions: testResults.length,
      correctAnswers,
      percentage: Math.round((correctAnswers / testResults.length) * 100),
    };
  }

  // Get difficult words
  async getDifficultWords(userId: number, limit: number = 20) {
    return await this.userVocabularyRepository.find({
      where: {
        userId,
        status: LearningStatus.DIFFICULT,
      },
      relations: ['vocabulary'],
      take: limit,
      order: { incorrectCount: 'DESC' },
    });
  }

  // Get user progress
  async getUserProgress(userId: number) {
    const totalLearned = await this.userVocabularyRepository.count({
      where: { userId },
    });

    const mastered = await this.userVocabularyRepository.count({
      where: { userId, status: LearningStatus.MASTERED },
    });

    const learning = await this.userVocabularyRepository.count({
      where: { userId, status: LearningStatus.LEARNING },
    });

    const difficult = await this.userVocabularyRepository.count({
      where: { userId, status: LearningStatus.DIFFICULT },
    });

    return {
      totalLearned,
      mastered,
      learning,
      difficult,
      masteryPercentage: totalLearned > 0 ? Math.round((mastered / totalLearned) * 100) : 0,
    };
  }

  // Get learning dashboard data
  async getLearningDashboard(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const todayProgress = await this.getTodayProgress(userId);
    const userProgress = await this.getUserProgress(userId);

    const wordsToReview = await this.userVocabularyRepository.count({
      where: {
        userId,
        nextReviewDate: LessThan(new Date()),
        status: LearningStatus.LEARNING,
      },
    });

    const progressPercentage = user?.dailyGoal > 0
      ? Math.round((todayProgress.totalProgress / user.dailyGoal) * 100)
      : 0;

    return {
      user: {
        dailyGoal: user?.dailyGoal || 10,
        currentStreak: user?.currentStreak || 0,
        longestStreak: user?.longestStreak || 0,
        totalWordsLearned: userProgress.totalLearned,
      },
      todayProgress,
      wordsToReview,
      difficultWords: userProgress.difficult,
      masteredWords: userProgress.mastered,
      totalLearned: userProgress.totalLearned,
      progressPercentage: Math.min(progressPercentage, 100),
    };
  }

  // Helper method to calculate next review date
  private calculateNextReviewDate(quality: number, successCount: number): Date {
    const now = new Date();
    let daysToAdd = 1;

    // Simple spaced repetition algorithm
    if (quality >= 4) {
      daysToAdd = Math.min(successCount * 2, 30); // Max 30 days
    } else if (quality === 3) {
      daysToAdd = Math.min(successCount, 7); // Max 7 days
    } else {
      daysToAdd = 1; // Review tomorrow if difficulty
    }

    now.setDate(now.getDate() + daysToAdd);
    return now;
  }
}
