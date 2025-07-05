import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between, In } from 'typeorm';
import { UserVocabulary, LearningStatus } from '../database/entities/user-vocabulary.entity';
import { User } from '../database/entities/user.entity';
import { Vocabulary } from '../database/entities/vocabulary.entity';
import { StudySessionDto } from './dto/learning.dto';
import { VocabularyCacheService } from './vocabulary-cache.service';

@Injectable()
export class LearningService {
  constructor(
    @InjectRepository(UserVocabulary)
    private userVocabularyRepository: Repository<UserVocabulary>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Vocabulary)
    private vocabularyRepository: Repository<Vocabulary>,
    private vocabularyCacheService: VocabularyCacheService,
  ) {}

  // Get today's learning progress for user - OPTIMIZED with Promise.all
  async getTodayProgress(userId: number) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayLearned, todayReviewed, todayReviewedRecords] = await Promise.all([
      this.userVocabularyRepository.count({
        where: {
          userId,
          firstLearnedDate: Between(today, tomorrow),
        },
      }),
      this.userVocabularyRepository.count({
        where: {
          userId,
          lastReviewedAt: Between(today, tomorrow),
        },
      }),
      this.userVocabularyRepository.find({
        where: {
          userId,
          lastReviewedAt: Between(today, tomorrow),
        },
        select: ['vocabularyId', 'lastReviewedAt'],
        take: 10
      })
    ]);

    return {
      wordsLearned: todayLearned,
      wordsReviewed: todayReviewed,
      totalProgress: todayLearned + todayReviewed,
    };
  }

  // Get new words for learning - SUPER OPTIMIZED VERSION
  async getNewWordsForLearning(userId: number, limit: number = 10, level?: string) {
    try {
      if (!level) {
        const user = await this.userRepository.findOne({
          where: { id: userId },
          select: ['level'],
          cache: 300000
        });
        level = user?.level || 'beginner';
      }
      const learnedRecords = await this.userVocabularyRepository
        .createQueryBuilder('uv')
        .select(['uv.vocabularyId'])
        .where('uv.userId = :userId', { userId })
        .cache(60000)
        .getMany();

      const learnedIds = learnedRecords.map(record => record.vocabularyId);
      const allWords = await this.vocabularyCacheService.getVocabularyByLevel(level, limit * 3);
      const unlearnedWords = allWords.filter(word => !learnedIds.includes(word.id));

      return unlearnedWords.slice(0, limit);

    } catch (error) {
      console.error('Error in optimized getNewWordsForLearning:', error);
      return this.getNewWordsForLearningFallback(userId, limit, level);
    }
  }

  // Fallback method for when cache fails
  private async getNewWordsForLearningFallback(userId: number, limit: number, level?: string) {
    if (!level) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: ['level']
      });
      level = user?.level || 'beginner';
    }

    return await this.vocabularyRepository
      .createQueryBuilder('v')
      .where('v.level = :level', { level })
      .andWhere('NOT EXISTS (SELECT 1 FROM user_vocabulary uv WHERE uv."vocabularyId" = v.id AND uv."userId" = :userId)', { userId })
      .orderBy('v.id', 'ASC')
      .take(limit)
      .getMany();
  }

  // Get words that need review today
  async getWordsForReview(userId: number, limit: number = 20, level?: string) {
    const now = new Date();

    // Get user's level if no level is specified
    if (!level) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      level = user?.level || 'beginner';
    }

    let query = this.userVocabularyRepository
      .createQueryBuilder('uv')
      .leftJoinAndSelect('uv.vocabulary', 'v')
      .where('uv.userId = :userId', { userId })
      .andWhere('uv.nextReviewDate < :now', { now })
      .andWhere('uv.status = :status', { status: LearningStatus.LEARNING })
      .andWhere('v.level = :level', { level });

    return await query
      .orderBy('uv.nextReviewDate', 'ASC')
      .take(limit)
      .getMany();
  }

  // Get review statistics by period
  async getReviewStats(userId: number) {
    const now = new Date();

    // Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // 7 days ago
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 30 days ago
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalWords, todayWords, yesterdayWords, last7DaysWords, last30DaysWords] = await Promise.all([
      // Total learned words
      this.userVocabularyRepository.count({
        where: { userId, status: LearningStatus.LEARNING }
      }),

      // Words learned today
      this.userVocabularyRepository.count({
        where: {
          userId,
          firstLearnedDate: Between(today, tomorrow)
        }
      }),

      // Words learned yesterday
      this.userVocabularyRepository.count({
        where: {
          userId,
          firstLearnedDate: Between(yesterday, today)
        }
      }),

      // Words learned in last 7 days
      this.userVocabularyRepository.count({
        where: {
          userId,
          firstLearnedDate: Between(sevenDaysAgo, today)
        }
      }),

      // Words learned in last 30 days
      this.userVocabularyRepository.count({
        where: {
          userId,
          firstLearnedDate: Between(thirtyDaysAgo, today)
        }
      })
    ]);

    return {
      totalWords,
      todayWords,
      yesterdayWords,
      last7DaysWords,
      last30DaysWords
    };
  }

  // Get words for review by period
  async getWordsForReviewByPeriod(userId: number, period: string, limit: number = 20, level?: string) {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date();

    // Calculate date ranges based on period
    switch (period) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        break;
      case 'yesterday':
        endDate = new Date();
        endDate.setHours(0, 0, 0, 0);
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7days':
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '30days':
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'all':
      default:
        // Return all learned words for review
        let query = this.userVocabularyRepository
          .createQueryBuilder('uv')
          .leftJoinAndSelect('uv.vocabulary', 'v')
          .where('uv.userId = :userId', { userId })
          .andWhere('uv.status = :status', { status: LearningStatus.LEARNING });

        if (level) {
          query = query.andWhere('v.level = :level', { level });
        }

        const result = await query
          .orderBy('uv.lastReviewedAt', 'ASC')
          .take(limit)
          .getMany();

        return result.map(item => item.vocabulary);
    }

    // For specific time periods
    let query = this.userVocabularyRepository
      .createQueryBuilder('uv')
      .leftJoinAndSelect('uv.vocabulary', 'v')
      .where('uv.userId = :userId', { userId })
      .andWhere('uv.firstLearnedDate BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('uv.status = :status', { status: LearningStatus.LEARNING });

    if (level) {
      query = query.andWhere('v.level = :level', { level });
    }

    const result = await query
      .orderBy('uv.firstLearnedDate', 'DESC')
      .take(limit)
      .getMany();

    return result.map(item => item.vocabulary);
  }

  // Record review result with feedback
  async recordReviewResult(userId: number, wordId: number, isCorrect: boolean, difficulty?: number) {
    const userVocab = await this.userVocabularyRepository.findOne({
      where: { userId, vocabularyId: wordId }
    });

    if (!userVocab) {
      throw new Error('User vocabulary record not found');
    }

    // Update review statistics
    userVocab.reviewCount = (userVocab.reviewCount || 0) + 1;
    userVocab.correctCount = (userVocab.correctCount || 0) + (isCorrect ? 1 : 0);
    if (!isCorrect) {
      userVocab.incorrectCount = (userVocab.incorrectCount || 0) + 1;
    }
    userVocab.lastReviewedAt = new Date();

    // Calculate next review date based on spaced repetition
    const intervals = [1, 3, 7, 14, 30, 90]; // days
    const currentInterval = Math.min(userVocab.reviewCount - 1, intervals.length - 1);
    const nextReviewDays = isCorrect ? intervals[currentInterval] : 1; // Reset if incorrect

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + nextReviewDays);
    userVocab.nextReviewDate = nextReviewDate;

    // Update mastery level based on performance
    const accuracy = userVocab.correctCount / userVocab.reviewCount;
    if (accuracy >= 0.9 && userVocab.reviewCount >= 3) { // Changed from 5 to 3
      userVocab.status = LearningStatus.MASTERED;
    } else if (accuracy < 0.5) {
      userVocab.status = LearningStatus.DIFFICULT;
    }

    await this.userVocabularyRepository.save(userVocab);

    // Update user statistics for review activity
    await this.updateUserStats(userId, false);

    return {
      success: true,
      nextReviewDate: userVocab.nextReviewDate,
      reviewCount: userVocab.reviewCount,
      accuracy: accuracy
    };
  }

  // Process study session
  async processStudySession(userId: number, studySessionDto: StudySessionDto) {
    const { vocabularyId, quality, responseTime } = studySessionDto;

    // Find or create UserVocabulary record
    let userVocab = await this.userVocabularyRepository.findOne({
      where: { userId, vocabularyId },
      relations: ['vocabulary'],
    });

    const isNewWord = !userVocab;

    if (!userVocab) {
      // Create new record for first-time learning
      userVocab = this.userVocabularyRepository.create({
        userId,
        vocabularyId,
        status: LearningStatus.NEW,
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        easeFactor: 2.5,
        interval: 1,
        firstLearnedDate: new Date(),
        nextReviewDate: this.calculateNextReviewDate(quality, 0),
      });
    }

    // Update learning statistics
    userVocab.reviewCount += 1;
    userVocab.lastReviewedAt = new Date();

    if (quality >= 3) {
      userVocab.correctCount += 1;
      userVocab.status = LearningStatus.LEARNING;
    } else {
      userVocab.incorrectCount += 1;
      userVocab.status = LearningStatus.DIFFICULT;
    }

    // Update next review date
    userVocab.nextReviewDate = this.calculateNextReviewDate(quality, userVocab.correctCount);

    // Update ease factor (spaced repetition algorithm)
    userVocab.easeFactor = Math.max(1.3, userVocab.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

    await this.userVocabularyRepository.save(userVocab);

    // Update User statistics
    await this.updateUserStats(userId, isNewWord);

    return {
      success: true,
      nextReviewDate: userVocab.nextReviewDate,
      status: userVocab.status,
    };
  }

  // Get difficult words
  async getDifficultWords(userId: number, limit: number = 20, level?: string) {
    let query = this.userVocabularyRepository
      .createQueryBuilder('uv')
      .leftJoinAndSelect('uv.vocabulary', 'v')
      .where('uv.userId = :userId', { userId })
      .andWhere('uv.status = :status', { status: LearningStatus.DIFFICULT });

    // Add level filter if provided
    if (level) {
      query = query.andWhere('v.level = :level', { level });
    }

    return await query
      .orderBy('uv.incorrectCount', 'DESC')
      .take(limit)
      .getMany();
  }

  // Get user progress
  async getUserProgress(userId: number, level?: string) {
    let query = this.userVocabularyRepository
      .createQueryBuilder('uv')
      .leftJoinAndSelect('uv.vocabulary', 'v')
      .where('uv.userId = :userId', { userId });

    // Add level filter if provided
    if (level) {
      query = query.andWhere('v.level = :level', { level });
    }

    const allUserVocabs = await query.getMany();

    const totalLearned = allUserVocabs.length;
    const mastered = allUserVocabs.filter(uv => uv.status === LearningStatus.MASTERED).length;
    const learning = allUserVocabs.filter(uv => uv.status === LearningStatus.LEARNING).length;
    const difficult = allUserVocabs.filter(uv => uv.status === LearningStatus.DIFFICULT).length;

    return {
      totalLearned,
      mastered,
      learning,
      difficult,
      masteryPercentage: totalLearned > 0 ? Math.round((mastered / totalLearned) * 100) : 0,
      level
    };
  }

  // Get learning dashboard data - Direct database fetch (no caching)
  async getLearningDashboard(userId: number) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [user, dashboardStats] = await Promise.all([
      this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'name', 'email', 'level', 'dailyGoal', 'currentStreak', 'longestStreak', 'totalWordsLearned', 'totalTestsTaken', 'averageTestScore', 'lastStudyDate', 'createdAt']
      }),

      this.userVocabularyRepository
        .createQueryBuilder('uv')
        .select([
          `SUM(CASE WHEN uv.firstLearnedDate >= :today AND uv.firstLearnedDate < :tomorrow THEN 1 ELSE 0 END) as todayLearned`,
          `SUM(CASE WHEN uv.lastReviewedAt >= :today AND uv.lastReviewedAt < :tomorrow THEN 1 ELSE 0 END) as todayReviewed`,
          'SUM(CASE WHEN uv.status != :newStatus THEN 1 ELSE 0 END) as totalLearned',
          'SUM(CASE WHEN uv.status = :mastered THEN 1 ELSE 0 END) as masteredWords',
          'SUM(CASE WHEN uv.status = :learning THEN 1 ELSE 0 END) as learningWords',
          'SUM(CASE WHEN uv.status = :difficult THEN 1 ELSE 0 END) as difficultWords',
          `SUM(CASE WHEN (uv.nextReviewDate IS NULL OR uv.nextReviewDate < :now) AND uv.status = :learning THEN 1 ELSE 0 END) as wordsToReview`
        ])
        .where('uv.userId = :userId', { userId })
        .setParameters({
          today: today.toISOString(),
          tomorrow: tomorrow.toISOString(),
          now: now.toISOString(),
          mastered: LearningStatus.MASTERED,
          learning: LearningStatus.LEARNING,
          difficult: LearningStatus.DIFFICULT,
          newStatus: LearningStatus.NEW
        })
        .getRawOne()
    ]);

    const todayProgress = {
      wordsLearned: parseInt(dashboardStats.todaylearned) || 0,
      wordsReviewed: parseInt(dashboardStats.todayreviewed) || 0,
      totalProgress: (parseInt(dashboardStats.todaylearned) || 0) + (parseInt(dashboardStats.todayreviewed) || 0)
    };

    const progressPercentage = user?.dailyGoal > 0
      ? Math.round((dashboardStats.todaylearned / user.dailyGoal) * 100)
      : 0;

    const totalWordsLearned = parseInt(dashboardStats.totallearned) || 0;
    const masteredWords = parseInt(dashboardStats.masteredwords) || 0;
    const learningWords = parseInt(dashboardStats.learningwords) || 0;
    const difficultWords = parseInt(dashboardStats.difficultwords) || 0;
    const wordsToReview = parseInt(dashboardStats.wordstoreview) || 0;

    const result = {
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        level: user?.level,
        dailyGoal: user?.dailyGoal || 10,
        currentStreak: user?.currentStreak || 0,
        longestStreak: user?.longestStreak || 0,
        totalWordsLearned: totalWordsLearned,
        totalTestsTaken: user?.totalTestsTaken || 0,
        averageTestScore: user?.averageTestScore || 0,
        lastStudyDate: user?.lastStudyDate || null,
        createdAt: user?.createdAt || null,
      },
      todayProgress,
      vocabulary: {
        wordsToReview: wordsToReview,
        difficultWords: difficultWords,
        masteredWords: masteredWords,
        learningWords: learningWords,
        totalLearned: totalWordsLearned,
      },
      progressPercentage: Math.min(progressPercentage, 100),
    };

    return result;
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

  // Get new words for learning by topic - UPDATED to use topics table
  async getNewWordsForLearningByTopic(userId: number, topicName: string, limit: number = 10, level?: string) {
    try {
      let targetLevel = level;
      if (!targetLevel) {
        const user = await this.userRepository.findOne({
          where: { id: userId },
          select: ['level'],
          cache: 300000
        });
        targetLevel = user?.level || 'beginner';
      }

      const learnedRecords = await this.userVocabularyRepository
        .createQueryBuilder('uv')
        .select(['uv.vocabularyId'])
        .where('uv.userId = :userId', { userId })
        .cache(60000)
        .getMany();

      const learnedIds = learnedRecords.map(record => record.vocabularyId);

      let queryBuilder = this.vocabularyRepository
        .createQueryBuilder('v')
        .innerJoin('v.topicEntity', 'topic')
        .where('topic.name = :topicName', { topicName })
        .andWhere('v.level = :level', { level: targetLevel });

      if (learnedIds.length > 0) {
        queryBuilder = queryBuilder.andWhere(
          'NOT EXISTS (SELECT 1 FROM user_vocabulary uv WHERE uv."vocabularyId" = v.id AND uv."userId" = :userId)',
          { userId }
        );
      }

      const result = await queryBuilder
        .orderBy('RANDOM()')
        .limit(limit)
        .getMany();


      return result;
    } catch (error) {
      console.error('❌ Error getting new words for learning by topic:', error);
      throw error;
    }
  }

  // Get words for review by topic - UPDATED to use topics table
  async getWordsForReviewByTopic(userId: number, topicName: string, limit: number = 20, level?: string) {
    const now = new Date();

    let query = this.userVocabularyRepository
      .createQueryBuilder('uv')
      .leftJoinAndSelect('uv.vocabulary', 'v')
      .innerJoin('v.topicEntity', 'topic')
      .where('uv.userId = :userId', { userId })
      .andWhere('uv.nextReviewDate < :now', { now })
      .andWhere('uv.status = :status', { status: LearningStatus.LEARNING })
      .andWhere('topic.name = :topicName', { topicName });

    if (level) {
      query = query.andWhere('v.level = :level', { level });
    }

    return await query
      .orderBy('uv.nextReviewDate', 'ASC')
      .take(limit)
      .getMany();
  }

  // Get review words by topic and period - UPDATED to use topics table
  async getReviewWordsByTopicAndPeriod(userId: number, topicName: string, period: string, limit: number = 20, level?: string) {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date();

    // Calculate date ranges based on period
    switch (period) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        break;
      case 'yesterday':
        endDate = new Date();
        endDate.setHours(0, 0, 0, 0);
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7days':
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '30days':
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'all':
      default:
        let query = this.userVocabularyRepository
          .createQueryBuilder('uv')
          .leftJoinAndSelect('uv.vocabulary', 'v')
          .innerJoin('v.topicEntity', 'topic')
          .where('uv.userId = :userId', { userId })
          .andWhere('topic.name = :topicName', { topicName })
          .andWhere('uv.status = :status', { status: LearningStatus.LEARNING });

        if (level) {
          query = query.andWhere('v.level = :level', { level });
        }

        const result = await query
          .orderBy('uv.lastReviewedAt', 'ASC')
          .take(limit)
          .getMany();

        return result.map(item => item.vocabulary);
    }

    // For specific time periods with topic filter using topics table
    let query = this.userVocabularyRepository
      .createQueryBuilder('uv')
      .leftJoinAndSelect('uv.vocabulary', 'v')
      .innerJoin('v.topicEntity', 'topic')
      .where('uv.userId = :userId', { userId })
      .andWhere('topic.name = :topicName', { topicName })
      .andWhere('uv.firstLearnedDate BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('uv.status = :status', { status: LearningStatus.LEARNING });

    if (level) {
      query = query.andWhere('v.level = :level', { level });
    }

    const result = await query
      .orderBy('uv.firstLearnedDate', 'DESC')
      .take(limit)
      .getMany();

    return result.map(item => item.vocabulary);
  }

  // Get user progress by topic - UPDATED to use topics table
  async getUserProgressByTopic(userId: number, topicName: string, level?: string) {
    let query = this.userVocabularyRepository
      .createQueryBuilder('uv')
      .leftJoinAndSelect('uv.vocabulary', 'v')
      .innerJoin('v.topicEntity', 'topic')
      .where('uv.userId = :userId', { userId })
      .andWhere('topic.name = :topicName', { topicName });

    if (level) {
      query = query.andWhere('v.level = :level', { level });
    }

    const filteredWords = await query.getMany();

    const totalLearned = filteredWords.length;
    const mastered = filteredWords.filter(uv => uv.status === LearningStatus.MASTERED).length;
    const learning = filteredWords.filter(uv => uv.status === LearningStatus.LEARNING).length;
    const difficult = filteredWords.filter(uv => uv.status === LearningStatus.DIFFICULT).length;

    return {
      topic: topicName,
      totalLearned,
      mastered,
      learning,
      difficult,
      masteryPercentage: totalLearned > 0 ? Math.round((mastered / totalLearned) * 100) : 0,
      level
    };
  }

  // Get user progress by multiple topics - UPDATED to use topics table
  async getUserProgressByMultipleTopics(userId: number, topicNames: string[], level?: string) {
    try {
      // Build a single optimized query instead of N separate queries
      let query = this.userVocabularyRepository
        .createQueryBuilder('uv')
        .leftJoin('uv.vocabulary', 'v')
        .leftJoin('v.topicEntity', 'topic')
        .select([
          'topic.name as topicName',
          'uv.status as status',
          'COUNT(*) as count'
        ])
        .where('uv.userId = :userId', { userId })
        .andWhere('topic.name IN (:...topicNames)', { topicNames })
        .groupBy('topic.name, uv.status');

      if (level) {
        query = query.andWhere('v.level = :level', { level });
      }

      const rawResults = await query.getRawMany();

      // Process results into the expected format
      const progressMap: Record<string, any> = {};

      // Initialize all topics with zero values
      topicNames.forEach(topicName => {
        progressMap[topicName] = {
          topic: topicName,
          totalLearned: 0,
          mastered: 0,
          learning: 0,
          difficult: 0,
          masteryPercentage: 0,
          level
        };
      });

      // Aggregate the raw results
      rawResults.forEach(row => {
        const topicName = row.topicname;
        const status = row.status;
        const count = parseInt(row.count);

        if (progressMap[topicName]) {
          progressMap[topicName].totalLearned += count;

          switch (status) {
            case LearningStatus.MASTERED:
              progressMap[topicName].mastered = count;
              break;
            case LearningStatus.LEARNING:
              progressMap[topicName].learning = count;
              break;
            case LearningStatus.DIFFICULT:
              progressMap[topicName].difficult = count;
              break;
          }
        }
      });

      // Calculate mastery percentages
      Object.values(progressMap).forEach((progress: any) => {
        if (progress.totalLearned > 0) {
          progress.masteryPercentage = Math.round((progress.mastered / progress.totalLearned) * 100);
        }
      });

      return progressMap;

    } catch (error) {
      console.error('Error in optimized getUserProgressByMultipleTopics:', error);

      // Fallback to the original method if optimized version fails
      return this.getUserProgressByMultipleTopicsLegacy(userId, topicNames, level);
    }
  }

  // Legacy method as fallback
  private async getUserProgressByMultipleTopicsLegacy(userId: number, topicNames: string[], level?: string) {
    const progressPromises = topicNames.map(async (topicName) => {
      try {
        let query = this.userVocabularyRepository
          .createQueryBuilder('uv')
          .leftJoinAndSelect('uv.vocabulary', 'v')
          .innerJoin('v.topicEntity', 'topic')
          .where('uv.userId = :userId', { userId })
          .andWhere('topic.name = :topicName', { topicName });

        if (level) {
          query = query.andWhere('v.level = :level', { level });
        }

        const filteredWords = await query.getMany();

        const totalLearned = filteredWords.length;
        const mastered = filteredWords.filter(uv => uv.status === LearningStatus.MASTERED).length;
        const learning = filteredWords.filter(uv => uv.status === LearningStatus.LEARNING).length;
        const difficult = filteredWords.filter(uv => uv.status === LearningStatus.DIFFICULT).length;

        return {
          topic: topicName,
          totalLearned,
          mastered,
          learning,
          difficult,
          masteryPercentage: totalLearned > 0 ? Math.round((mastered / totalLearned) * 100) : 0,
          level
        };
      } catch (error) {
        console.error(`Error getting progress for topic ${topicName}:`, error);
        return {
          topic: topicName,
          totalLearned: 0,
          mastered: 0,
          learning: 0,
          difficult: 0,
          masteryPercentage: 0,
          level
        };
      }
    });

    const results = await Promise.all(progressPromises);

    // Convert array to object for easier access
    const progressMap: Record<string, any> = {};
    results.forEach(progress => {
      progressMap[progress.topic] = progress;
    });

    return progressMap;
  }

  // Generate test questions
  async generateTest(userId: number, count: number = 10, mode: 'en-to-vi' | 'vi-to-en' | 'mixed' = 'mixed', inputType: 'multiple-choice' | 'text-input' | 'mixed' = 'multiple-choice') {
    // Get learned words for test
    const learnedWords = await this.userVocabularyRepository.find({
      where: { userId },
      relations: ['vocabulary'],
      take: count * 2,
      order: { lastReviewedAt: 'DESC' },
    });

    if (learnedWords.length === 0) {
      return [];
    }

    const testQuestions = [];

    for (let i = 0; i < Math.min(count, learnedWords.length); i++) {
      const userVocab = learnedWords[i];
      const word = userVocab.vocabulary;

      // Determine question type based on mode
      let questionType: 'en-to-vi' | 'vi-to-en';
      if (mode === 'mixed') {
        questionType = Math.random() > 0.5 ? 'en-to-vi' : 'vi-to-en';
      } else {
        questionType = mode;
      }

      // Determine input type
      let currentInputType: 'multiple-choice' | 'text-input';
      if (inputType === 'mixed') {
        currentInputType = Math.random() > 0.5 ? 'multiple-choice' : 'text-input';
      } else {
        currentInputType = inputType;
      }

      if (currentInputType === 'text-input') {
        // Text input questions
        if (questionType === 'en-to-vi') {
          testQuestions.push({
            vocabularyId: word.id,
            questionType: 'en-to-vi',
            inputType: 'text-input',
            question: `Nghĩa của từ "${word.word}" là gì?`,
            correctAnswer: word.meaning.toLowerCase().trim(),
            word: word.word,
            pronunciation: word.pronunciation,
          });
        } else {
          testQuestions.push({
            vocabularyId: word.id,
            questionType: 'vi-to-en',
            inputType: 'text-input',
            question: `Từ tiếng Anh của "${word.meaning}" là gì?`,
            correctAnswer: word.word.toLowerCase().trim(),
            meaning: word.meaning,
            pronunciation: word.pronunciation,
          });
        }
      } else {
        // Multiple choice questions - IMPROVED: Use same topic answers first
        const wrongAnswers = await this.getWrongAnswersForQuestion(
          word.id,
          questionType,
          word.topicId, // Pass topicId to prioritize same topic answers
          3
        );

        if (questionType === 'en-to-vi') {
          const options = [
            { id: 1, text: word.meaning, isCorrect: true },
            { id: 2, text: wrongAnswers[0], isCorrect: false },
            { id: 3, text: wrongAnswers[1], isCorrect: false },
            { id: 4, text: wrongAnswers[2], isCorrect: false },
          ].sort(() => Math.random() - 0.5);

          testQuestions.push({
            vocabularyId: word.id,
            questionType: 'en-to-vi',
            inputType: 'multiple-choice',
            question: `Nghĩa của từ "${word.word}" là gì?`,
            options,
            correctAnswerId: options.find(opt => opt.isCorrect)?.id,
            word: word.word,
            pronunciation: word.pronunciation,
            topicId: word.topicId, // Add topicId here
          });
        } else {
          const options = [
            { id: 1, text: word.word, isCorrect: true },
            { id: 2, text: wrongAnswers[0], isCorrect: false },
            { id: 3, text: wrongAnswers[1], isCorrect: false },
            { id: 4, text: wrongAnswers[2], isCorrect: false },
          ].sort(() => Math.random() - 0.5);

          testQuestions.push({
            vocabularyId: word.id,
            questionType: 'vi-to-en',
            inputType: 'multiple-choice',
            question: `Từ tiếng Anh của "${word.meaning}" là gì?`,
            options,
            correctAnswerId: options.find(opt => opt.isCorrect)?.id,
            meaning: word.meaning,
            pronunciation: word.pronunciation,
            topicId: word.topicId, // Add topicId here
          });
        }
      }
    }

    return testQuestions;
  }

  // Generate test questions by topicId
  async generateTestByTopicId(
    userId: number,
    topicId: number,
    count: number = 10,
    mode: 'en-to-vi' | 'vi-to-en' | 'mixed' = 'mixed',
    inputType: 'multiple-choice' | 'text-input' | 'mixed' = 'multiple-choice',
    level?: string
  ) {
    const learnedWords = await this.userVocabularyRepository.find({
      where: { userId },
      relations: ['vocabulary'],
      take: count * 3,
      order: { lastReviewedAt: 'DESC' },
    });

    const topicWords = learnedWords.filter(userVocab => userVocab.vocabulary.topicId === topicId);

    if (topicWords.length === 0) {
      return [];
    }

    const testQuestions = [];
    const selectedWords = topicWords.slice(0, Math.min(count, topicWords.length));

    for (let i = 0; i < selectedWords.length; i++) {
      const userVocab = selectedWords[i];
      const word = userVocab.vocabulary;

      // Determine question type based on mode
      let questionType: 'en-to-vi' | 'vi-to-en';
      if (mode === 'mixed') {
        questionType = Math.random() > 0.5 ? 'en-to-vi' : 'vi-to-en';
      } else {
        questionType = mode;
      }

      // Determine input type
      let currentInputType: 'multiple-choice' | 'text-input';
      if (inputType === 'mixed') {
        currentInputType = Math.random() > 0.5 ? 'multiple-choice' : 'text-input';
      } else {
        currentInputType = inputType;
      }

      if (currentInputType === 'text-input') {
        // Text input questions
        if (questionType === 'en-to-vi') {
          testQuestions.push({
            vocabularyId: word.id,
            questionType: 'en-to-vi',
            inputType: 'text-input',
            question: `Nghĩa của từ "${word.word}" là gì?`,
            correctAnswer: word.meaning.toLowerCase().trim(),
            word: word.word,
            pronunciation: word.pronunciation,
            topicId: word.topicId,
          });
        } else {
          testQuestions.push({
            vocabularyId: word.id,
            questionType: 'vi-to-en',
            inputType: 'text-input',
            question: `Từ tiếng Anh của "${word.meaning}" là gì?`,
            correctAnswer: word.word.toLowerCase().trim(),
            meaning: word.meaning,
            pronunciation: word.pronunciation,
            topicId: word.topicId,
          });
        }
      } else {
        // Multiple choice questions
        const wrongAnswers = await this.getWrongAnswersForQuestion(
          word.id,
          questionType,
          word.topicId,
          3
        );

        if (questionType === 'en-to-vi') {
          const options = [
            { id: 1, text: word.meaning, isCorrect: true },
            { id: 2, text: wrongAnswers[0], isCorrect: false },
            { id: 3, text: wrongAnswers[1], isCorrect: false },
            { id: 4, text: wrongAnswers[2], isCorrect: false },
          ].sort(() => Math.random() - 0.5);

          testQuestions.push({
            vocabularyId: word.id,
            questionType: 'en-to-vi',
            inputType: 'multiple-choice',
            question: `Nghĩa của từ "${word.word}" là gì?`,
            options,
            correctAnswerId: options.find(opt => opt.isCorrect)?.id,
            word: word.word,
            pronunciation: word.pronunciation,
            topicId: word.topicId,
          });
        } else {
          const options = [
            { id: 1, text: word.word, isCorrect: true },
            { id: 2, text: wrongAnswers[0], isCorrect: false },
            { id: 3, text: wrongAnswers[1], isCorrect: false },
            { id: 4, text: wrongAnswers[2], isCorrect: false },
          ].sort(() => Math.random() - 0.5);

          testQuestions.push({
            vocabularyId: word.id,
            questionType: 'vi-to-en',
            inputType: 'multiple-choice',
            question: `Từ tiếng Anh của "${word.meaning}" là gì?`,
            options,
            correctAnswerId: options.find(opt => opt.isCorrect)?.id,
            meaning: word.meaning,
            pronunciation: word.pronunciation,
            topicId: word.topicId,
          });
        }
      }
    }

    return testQuestions;
  }

  // Submit test results - OPTIMIZED VERSION
  async submitTestResults(userId: number, testResults: any[]) {
    try {
      if (!testResults || testResults.length === 0) {
        return {
          totalQuestions: 0,
          correctAnswers: 0,
          percentage: 0,
        };
      }

      let correctAnswers = 0;

      // Calculate correct answers first
      testResults.forEach(result => {
        const isCorrect = result.selectedOptionId === result.correctOptionId;
        if (isCorrect) correctAnswers++;
      });

      // Calculate test score BEFORE the transaction
      const testScore = Math.round((correctAnswers / testResults.length) * 100);

      // Batch process all vocabulary updates in a single transaction
      await this.userVocabularyRepository.manager.transaction(async manager => {
        // Get all vocabulary IDs from test results
        const vocabularyIds = testResults.map(result => result.vocabularyId);

        // Fetch all existing records in a single query
        const existingRecords = await manager.find(UserVocabulary, {
          where: {
            userId,
            vocabularyId: In(vocabularyIds)
          }
        });

        // Create a map for quick lookup
        const existingRecordsMap = new Map<number, UserVocabulary>();
        existingRecords.forEach(record => {
          existingRecordsMap.set(record.vocabularyId, record);
        });

        // Prepare bulk updates and inserts
        const recordsToUpdate: UserVocabulary[] = [];
        const recordsToCreate: Partial<UserVocabulary>[] = [];

        testResults.forEach(result => {
          const isCorrect = result.selectedOptionId === result.correctOptionId;
          const quality = isCorrect ? 4 : 2;
          const existingRecord = existingRecordsMap.get(result.vocabularyId);

          if (existingRecord) {
            // Update existing record
            existingRecord.reviewCount += 1;
            existingRecord.correctCount += isCorrect ? 1 : 0;
            existingRecord.incorrectCount += !isCorrect ? 1 : 0;
            existingRecord.lastReviewedAt = new Date();
            existingRecord.status = isCorrect ? LearningStatus.LEARNING : LearningStatus.DIFFICULT;
            existingRecord.nextReviewDate = this.calculateNextReviewDate(quality, existingRecord.correctCount);
            existingRecord.easeFactor = Math.max(1.3, existingRecord.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

            recordsToUpdate.push(existingRecord);
          } else {
            // Create new record
            recordsToCreate.push({
              userId,
              vocabularyId: result.vocabularyId,
              status: isCorrect ? LearningStatus.LEARNING : LearningStatus.DIFFICULT,
              reviewCount: 1,
              correctCount: isCorrect ? 1 : 0,
              incorrectCount: !isCorrect ? 1 : 0,
              easeFactor: 2.5,
              interval: 1,
              firstLearnedDate: new Date(),
              nextReviewDate: this.calculateNextReviewDate(quality, isCorrect ? 1 : 0),
              lastReviewedAt: new Date(),
            });
          }
        });

        // Execute bulk operations
        if (recordsToUpdate.length > 0) {
          await manager.save(UserVocabulary, recordsToUpdate);
        }

        if (recordsToCreate.length > 0) {
          await manager.save(UserVocabulary, recordsToCreate);
        }

        // Update user test statistics within the same transaction
        const user = await manager.findOne(User, { where: { id: userId } });
        if (user) {
          const currentTotalTests = user.totalTestsTaken || 0;
          const currentAverageScore = user.averageTestScore || 0;

          // Calculate new average score
          const newTotalTests = currentTotalTests + 1;
          const newAverageScore = ((currentAverageScore * currentTotalTests) + testScore) / newTotalTests;

          user.totalTestsTaken = newTotalTests;
          user.averageTestScore = Math.round(newAverageScore * 100) / 100;

          await manager.save(User, user);
        }
      });

      const response = {
        totalQuestions: testResults.length,
        correctAnswers,
        percentage: testScore,
      };

      return response;
    } catch (error) {
      console.error('❌ Error in submitTestResults:', error);
      throw error;
    }
  }


  // Get words learned today
  async getTodayLearnedWords(userId: number): Promise<any[]> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayLearnedWords = await this.userVocabularyRepository.find({
      where: {
        userId,
        firstLearnedDate: Between(today, tomorrow),
      },
      relations: ['vocabulary'],
      order: { firstLearnedDate: 'DESC' },
    });

    return todayLearnedWords.map(uv => ({
      id: uv.vocabulary.id,
      word: uv.vocabulary.word,
      meaning: uv.vocabulary.meaning,
      pronunciation: uv.vocabulary.pronunciation,
      partOfSpeech: uv.vocabulary.partOfSpeech,
      example: uv.vocabulary.example,
      exampleVi: uv.vocabulary.exampleVi,
      firstLearnedDate: uv.firstLearnedDate,
      status: uv.status,
    }));
  }

  // Get words reviewed today
  async getTodayReviewedWords(userId: number): Promise<any[]> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayReviewedWords = await this.userVocabularyRepository.find({
      where: {
        userId,
        lastReviewedAt: Between(today, tomorrow),
      },
      relations: ['vocabulary'],
      order: { lastReviewedAt: 'DESC' },
    });

    return todayReviewedWords.map(uv => ({
      id: uv.vocabulary.id,
      word: uv.vocabulary.word,
      meaning: uv.vocabulary.meaning,
      pronunciation: uv.vocabulary.pronunciation,
      partOfSpeech: uv.vocabulary.partOfSpeech,
      example: uv.vocabulary.example,
      exampleVi: uv.vocabulary.exampleVi,
      lastReviewedAt: uv.lastReviewedAt,
      status: uv.status,
      correctCount: uv.correctCount,
      incorrectCount: uv.incorrectCount,
      reviewCount: uv.reviewCount,
    }));
  }

  // Update user statistics - called when user learns new words or reviews
  private async updateUserStats(userId: number, isNewWord: boolean = false) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const now = new Date();

      // Get the previous lastStudyDate before updating
      const previousLastStudyDate = user.lastStudyDate ? new Date(user.lastStudyDate) : null;
      const previousLastStudyDateOnly = previousLastStudyDate ? new Date(previousLastStudyDate.getFullYear(), previousLastStudyDate.getMonth(), previousLastStudyDate.getDate()) : null;

      // Check if this is a new study day
      const isNewStudyDay = !previousLastStudyDateOnly || previousLastStudyDateOnly.getTime() !== today.getTime();

      if (isNewStudyDay) {
        // Check if it's consecutive (yesterday)
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (previousLastStudyDateOnly && previousLastStudyDateOnly.getTime() === yesterday.getTime()) {
          // Consecutive day - increment streak
          user.currentStreak = (user.currentStreak || 0) + 1;
        } else {
          // Not consecutive - reset streak to 1
          user.currentStreak = 1;
        }

        // Update longest streak if current is longer
        user.longestStreak = Math.max(user.longestStreak || 0, user.currentStreak);
      }

      // Update last study date
      user.lastStudyDate = now;

      // Update total words learned count if it's a new word
      if (isNewWord) {
        user.totalWordsLearned = (user.totalWordsLearned || 0) + 1;
      }

      await this.userRepository.save(user);
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }

  // Update user test statistics
  private async updateUserTestStats(userId: number, testScore: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) return;

      const currentTotalTests = user.totalTestsTaken || 0;
      const currentAverageScore = user.averageTestScore || 0;

      // Calculate new average score
      const newTotalTests = currentTotalTests + 1;
      const newAverageScore = ((currentAverageScore * currentTotalTests) + testScore) / newTotalTests;

      user.totalTestsTaken = newTotalTests;
      user.averageTestScore = Math.round(newAverageScore * 100) / 100; // Round to 2 decimal places

      await this.userRepository.save(user);
    } catch (error) {
      console.error('Error updating user test stats:', error);
    }
  }

  // Get wrong answers for multiple choice questions
  private async getWrongAnswersForQuestion(
    vocabularyId: number,
    questionType: 'en-to-vi' | 'vi-to-en',
    topicId?: number,
    count: number = 3
  ): Promise<string[]> {
    try {
      let queryBuilder = this.vocabularyRepository
        .createQueryBuilder('v')
        .where('v.id != :vocabularyId', { vocabularyId });

      // Prioritize same topic if topicId is provided
      if (topicId) {
        queryBuilder = queryBuilder
          .orderBy(`CASE WHEN v.topicId = :topicId THEN 0 ELSE 1 END`, 'ASC')
          .addOrderBy('RANDOM()')
          .setParameter('topicId', topicId);
      } else {
        queryBuilder = queryBuilder.orderBy('RANDOM()');
      }

      const randomWords = await queryBuilder
        .take(count * 2) // Get more than needed as fallback
        .getMany();

      const wrongAnswers: string[] = [];

      for (const word of randomWords) {
        if (wrongAnswers.length >= count) break;

        const answer = questionType === 'en-to-vi' ? word.meaning : word.word;
        if (answer && !wrongAnswers.includes(answer)) {
          wrongAnswers.push(answer);
        }
      }

      // If we don't have enough wrong answers, fill with generic ones
      while (wrongAnswers.length < count) {
        if (questionType === 'en-to-vi') {
          const genericAnswers = ['không biết', 'khác', 'khác nữa'];
          wrongAnswers.push(genericAnswers[wrongAnswers.length % genericAnswers.length]);
        } else {
          const genericAnswers = ['unknown', 'other', 'different'];
          wrongAnswers.push(genericAnswers[wrongAnswers.length % genericAnswers.length]);
        }
      }

      return wrongAnswers.slice(0, count);
    } catch (error) {
      console.error('Error getting wrong answers:', error);
      // Return fallback answers
      if (questionType === 'en-to-vi') {
        return ['không biết', 'khác', 'khác nữa'].slice(0, count);
      } else {
        return ['unknown', 'other', 'different'].slice(0, count);
      }
    }
  }
}
