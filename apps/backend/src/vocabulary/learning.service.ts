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
        lastReviewDate: Between(today, tomorrow),
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
        status: LearningStatus.REVIEWING,
      },
      relations: ['vocabulary'],
      order: { nextReviewDate: 'ASC' },
      take: limit,
    });
  }

  // Get new words for learning
  async getNewWordsForLearning(userId: number, limit: number = 10) {
    // Get words user hasn't seen yet
    const learnedWordIds = await this.userVocabularyRepository.find({
      where: { userId },
      select: ['vocabularyId'],
    });

    const learnedIds = learnedWordIds.map(uv => uv.vocabularyId);

    const queryBuilder = this.vocabularyRepository.createQueryBuilder('vocabulary');

    if (learnedIds.length > 0) {
      queryBuilder.where('vocabulary.id NOT IN (:...learnedIds)', { learnedIds });
    }

    return await queryBuilder
      .orderBy('RANDOM()')
      .limit(limit)
      .getMany();
  }

  // Process study session result with spaced repetition
  async processStudySession(userId: number, sessionData: StudySessionDto) {
    let userVocab = await this.userVocabularyRepository.findOne({
      where: { userId, vocabularyId: sessionData.vocabularyId },
    });

    if (!userVocab) {
      // First time learning this word
      userVocab = this.userVocabularyRepository.create({
        userId,
        vocabularyId: sessionData.vocabularyId,
        status: LearningStatus.LEARNING,
        firstLearnedDate: new Date(),
      });
    }

    // Update based on quality (0-5 scale)
    const quality = sessionData.quality;

    if (quality >= 3) {
      userVocab.correctCount++;

      // Calculate next review using spaced repetition algorithm
      if (quality >= 4) {
        // Good response
        userVocab.easeFactor = Math.max(1.3, userVocab.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
      } else {
        // Acceptable response
        userVocab.easeFactor = Math.max(1.3, userVocab.easeFactor - 0.14);
      }

      if (userVocab.reviewCount === 0) {
        userVocab.interval = 1;
      } else if (userVocab.reviewCount === 1) {
        userVocab.interval = 6;
      } else {
        userVocab.interval = Math.round(userVocab.interval * userVocab.easeFactor);
      }

      userVocab.status = userVocab.reviewCount >= 3 ? LearningStatus.MASTERED : LearningStatus.REVIEWING;

    } else {
      // Poor response
      userVocab.incorrectCount++;
      userVocab.interval = 1;
      userVocab.status = LearningStatus.DIFFICULT;
      userVocab.easeFactor = Math.max(1.3, userVocab.easeFactor - 0.2);
    }

    userVocab.reviewCount++;
    userVocab.lastReviewDate = new Date();
    userVocab.nextReviewDate = new Date(Date.now() + userVocab.interval * 24 * 60 * 60 * 1000);

    await this.userVocabularyRepository.save(userVocab);

    // Update user statistics
    await this.updateUserStats(userId);

    return userVocab;
  }

  // Get learning dashboard data
  async getLearningDashboard(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const todayProgress = await this.getTodayProgress(userId);

    const wordsToReview = await this.userVocabularyRepository.count({
      where: {
        userId,
        nextReviewDate: LessThan(new Date()),
        status: LearningStatus.REVIEWING,
      },
    });

    const difficultWords = await this.userVocabularyRepository.count({
      where: { userId, status: LearningStatus.DIFFICULT },
    });

    const masteredWords = await this.userVocabularyRepository.count({
      where: { userId, status: LearningStatus.MASTERED },
    });

    const totalLearned = await this.userVocabularyRepository.count({
      where: { userId },
    });

    return {
      user: {
        dailyGoal: user.dailyGoal,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        totalWordsLearned: user.totalWordsLearned,
      },
      todayProgress,
      wordsToReview,
      difficultWords,
      masteredWords,
      totalLearned,
      progressPercentage: Math.round((todayProgress.totalProgress / user.dailyGoal) * 100),
    };
  }

  // Generate multiple choice test
  async generateTest(userId: number, count: number = 10) {
    // Get user's learned words for testing
    const userWords = await this.userVocabularyRepository.find({
      where: {
        userId,
        status: LearningStatus.REVIEWING,
      },
      relations: ['vocabulary'],
      order: { lastReviewDate: 'ASC' },
      take: count,
    });

    const questions = [];

    for (const userWord of userWords) {
      // Get 3 random wrong answers
      const wrongAnswers = await this.vocabularyRepository
        .createQueryBuilder('vocabulary')
        .where('vocabulary.id != :correctId', { correctId: userWord.vocabulary.id })
        .orderBy('RANDOM()')
        .limit(3)
        .getMany();

      const options = [
        { id: userWord.vocabulary.id, text: userWord.vocabulary.meaning, isCorrect: true },
        ...wrongAnswers.map(w => ({ id: w.id, text: w.meaning, isCorrect: false })),
      ];

      // Shuffle options
      options.sort(() => Math.random() - 0.5);

      questions.push({
        vocabularyId: userWord.vocabulary.id,
        question: `What does "${userWord.vocabulary.word}" mean?`,
        options,
        correctAnswerId: userWord.vocabulary.id,
      });
    }

    return questions;
  }

  private async updateUserStats(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastStudy = user.lastStudyDate ? new Date(user.lastStudyDate) : null;

    if (!lastStudy || lastStudy < today) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastStudy && lastStudy.getTime() === yesterday.getTime()) {
        user.currentStreak++;
      } else if (!lastStudy || lastStudy < yesterday) {
        user.currentStreak = 1;
      }

      user.longestStreak = Math.max(user.longestStreak, user.currentStreak);
      user.lastStudyDate = today;
    }

    // Update total words learned
    user.totalWordsLearned = await this.userVocabularyRepository.count({
      where: { userId },
    });

    await this.userRepository.save(user);
  }
}
