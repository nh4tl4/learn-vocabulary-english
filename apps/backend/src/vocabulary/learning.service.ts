import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between } from 'typeorm';
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

    console.log(`📊 Getting today progress for user ${userId}:`);
    console.log(`📅 Today range: ${today.toISOString()} to ${tomorrow.toISOString()}`);

    // Use Promise.all to run queries in parallel
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
      // Debug: Get actual records for today's reviews
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
      // Get user's level from cache or database
      if (!level) {
        const user = await this.userRepository.findOne({
          where: { id: userId },
          select: ['level'],
          cache: 300000 // Cache for 5 minutes
        });
        level = user?.level || 'beginner';
      }
      console.log(level)

      // Get learned word IDs efficiently
      const learnedIds = await this.userVocabularyRepository
        .createQueryBuilder('uv')
        .select('uv.vocabularyId')
        .where('uv.userId = :userId', { userId })
        .cache(60000) // Cache for 1 minute
        .getRawMany()
        .then(results => results.map(item => item.uv_vocabularyId));

      // Use cache service to get vocabulary by level
      const allWords = await this.vocabularyCacheService.getVocabularyByLevel(level, limit * 3);

      // Filter out already learned words
      const unlearnedWords = allWords.filter(word => !learnedIds.includes(word.id));

      return unlearnedWords.slice(0, limit);

    } catch (error) {
      console.error('Error in optimized getNewWordsForLearning:', error);

      // Fallback to direct database query
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
      .andWhere('NOT EXISTS (SELECT 1 FROM user_vocabulary uv WHERE uv.vocabularyId = v.id AND uv.userId = :userId)', { userId })
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
    if (accuracy >= 0.9 && userVocab.reviewCount >= 5) {
      userVocab.status = LearningStatus.MASTERED;
    } else if (accuracy < 0.5) {
      userVocab.status = LearningStatus.DIFFICULT;
    }

    await this.userVocabularyRepository.save(userVocab);

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

  // Get learning dashboard data - HEAVILY OPTIMIZED with Promise.all
  async getLearningDashboard(userId: number) {
    // Run all independent queries in parallel for maximum performance
    const [user, todayProgress, userProgress, wordsToReview] = await Promise.all([
      // Get user info
      this.userRepository.findOne({ where: { id: userId } }),

      // Get today's progress
      this.getTodayProgress(userId),

      // Get user progress stats
      this.getUserProgress(userId),

      // Fix: Include words that need review (nextReviewDate is null or less than now)
      this.userVocabularyRepository.count({
        where: [
          {
            userId,
            nextReviewDate: LessThan(new Date()),
            status: LearningStatus.LEARNING,
          },
          {
            userId,
            nextReviewDate: null,
            status: LearningStatus.LEARNING,
          }
        ],
      })
    ]);


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

  // Get new words for learning by topic - OPTIMIZED VERSION
  async getNewWordsForLearningByTopic(userId: number, topic: string, limit: number = 10, level?: string) {
    try {
      // Get user's level if not provided, but prioritize the level parameter from FE
      let targetLevel = level; // Use level from FE if provided
      if (!targetLevel) {
        const user = await this.userRepository.findOne({
          where: { id: userId },
          select: ['level'],
          cache: 300000 // Cache for 5 minutes
        });
        targetLevel = user?.level || 'beginner';
      }

      console.log(`🔍 Getting words for topic: ${topic}, level: ${targetLevel}, limit: ${limit}, userId: ${userId}`);

      // Get learned word IDs efficiently with cache
      const learnedIds = await this.userVocabularyRepository
        .createQueryBuilder('uv')
        .select('uv.vocabularyId')
        .where('uv.userId = :userId', { userId })
        .cache(60000) // Cache for 1 minute
        .getRawMany()
        .then(results => results.map(item => item.uv_vocabularyId));

      console.log(`📖 User has learned ${learnedIds.length} words`);

      // Try using cache service first for topic-level combination
      const allWords = await this.vocabularyCacheService.getVocabularyByTopic(topic, targetLevel, limit * 3);

      if (allWords.length > 0) {
        console.log(`📊 Cache hit: Found ${allWords.length} words from cache`);

        // Filter out already learned words
        const unlearnedWords = allWords.filter(word => !learnedIds.includes(word.id));

        console.log(`📊 After filtering: ${unlearnedWords.length} unlearned words`);

        return unlearnedWords.slice(0, limit);
      }

      // Fallback to direct database query with optimized approach
      console.log(`⚠️ Cache miss, using optimized database query`);

      // Use EXISTS clause for better performance instead of NOT IN
      let queryBuilder = this.vocabularyRepository
        .createQueryBuilder('v')
        .where('v.topic = :topic', { topic })
        .andWhere('v.level = :level', { level: targetLevel });

      // Use EXISTS instead of NOT IN for better performance
      if (learnedIds.length > 0) {
        queryBuilder = queryBuilder.andWhere(
          'NOT EXISTS (SELECT 1 FROM user_vocabulary uv WHERE uv.vocabularyId = v.id AND uv.userId = :userId)',
          { userId }
        );
      }

      queryBuilder = queryBuilder
        .orderBy('v.id', 'ASC')
        .take(limit);

      // Log the final query for debugging
      const query = queryBuilder.getQuery();
      const parameters = queryBuilder.getParameters();
      console.log(`🔍 Final query:`, query);
      console.log(`🔍 Parameters:`, parameters);

      const result = await queryBuilder.getMany();
      console.log(`📊 Query returned ${result.length} words`);

      // If no results, let's check what's available
      if (result.length === 0) {
        // Debug: Check if there are any words for this topic and level
        const totalWordsForTopicLevel = await this.vocabularyRepository.count({
          where: { topic, level: targetLevel }
        });
        console.log(`🔍 Debug: Total words for topic '${topic}' and level '${targetLevel}': ${totalWordsForTopicLevel}`);

        // Debug: Check if there are any words for this topic (any level)
        const totalWordsForTopic = await this.vocabularyRepository.count({
          where: { topic }
        });
        console.log(`🔍 Debug: Total words for topic '${topic}' (any level): ${totalWordsForTopic}`);
      }

      return result;
    } catch (error) {
      console.error('❌ Error getting new words for learning by topic:', error);
      throw error;
    }
  }

  // Get words for review by topic
  async getWordsForReviewByTopic(userId: number, topic: string, limit: number = 20, level?: string) {
    const now = new Date();

    let query = this.userVocabularyRepository
      .createQueryBuilder('uv')
      .leftJoinAndSelect('uv.vocabulary', 'v')
      .where('uv.userId = :userId', { userId })
      .andWhere('uv.nextReviewDate < :now', { now })
      .andWhere('uv.status = :status', { status: LearningStatus.LEARNING })
      .andWhere('v.topic = :topic', { topic });

    if (level) {
      query = query.andWhere('v.level = :level', { level });
    }

    return await query
      .orderBy('uv.nextReviewDate', 'ASC')
      .take(limit)
      .getMany();
  }

  // Get review words by topic and period
  async getReviewWordsByTopicAndPeriod(userId: number, topic: string, period: string, limit: number = 20, level?: string) {
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
          .where('uv.userId = :userId', { userId })
          .andWhere('v.topic = :topic', { topic })
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

    // For specific time periods with topic filter
    let query = this.userVocabularyRepository
      .createQueryBuilder('uv')
      .leftJoinAndSelect('uv.vocabulary', 'v')
      .where('uv.userId = :userId', { userId })
      .andWhere('v.topic = :topic', { topic })
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

  // Get user progress by topic
  async getUserProgressByTopic(userId: number, topic: string, level?: string) {
    let query = this.userVocabularyRepository
      .createQueryBuilder('uv')
      .leftJoinAndSelect('uv.vocabulary', 'v')
      .where('uv.userId = :userId', { userId })
      .andWhere('v.topic = :topic', { topic });

    if (level) {
      query = query.andWhere('v.level = :level', { level });
    }

    const filteredWords = await query.getMany();

    const totalLearned = filteredWords.length;
    const mastered = filteredWords.filter(uv => uv.status === LearningStatus.MASTERED).length;
    const learning = filteredWords.filter(uv => uv.status === LearningStatus.LEARNING).length;
    const difficult = filteredWords.filter(uv => uv.status === LearningStatus.DIFFICULT).length;

    return {
      topic,
      totalLearned,
      mastered,
      learning,
      difficult,
      masteryPercentage: totalLearned > 0 ? Math.round((mastered / totalLearned) * 100) : 0,
      level
    };
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
        // Multiple choice questions
        const wrongAnswers = await this.vocabularyRepository
          .createQueryBuilder('v')
          .where('v.id != :correctId', { correctId: word.id })
          .orderBy('RANDOM()')
          .take(3)
          .getMany();

        if (questionType === 'en-to-vi') {
          const options = [
            { id: 1, text: word.meaning, isCorrect: true },
            { id: 2, text: wrongAnswers[0]?.meaning || 'Đáp án sai 1', isCorrect: false },
            { id: 3, text: wrongAnswers[1]?.meaning || 'Đáp án sai 2', isCorrect: false },
            { id: 4, text: wrongAnswers[2]?.meaning || 'Đáp án sai 3', isCorrect: false },
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
          });
        } else {
          const options = [
            { id: 1, text: word.word, isCorrect: true },
            { id: 2, text: wrongAnswers[0]?.word || 'wrong1', isCorrect: false },
            { id: 3, text: wrongAnswers[1]?.word || 'wrong2', isCorrect: false },
            { id: 4, text: wrongAnswers[2]?.word || 'wrong3', isCorrect: false },
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
          });
        }
      }
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
}
