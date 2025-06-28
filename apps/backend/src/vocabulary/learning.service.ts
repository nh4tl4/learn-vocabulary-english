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
    try {
      // Get words user hasn't learned yet
      const learnedWordIds = await this.userVocabularyRepository
        .createQueryBuilder('uv')
        .select('uv.vocabularyId')
        .where('uv.userId = :userId', { userId })
        .getRawMany();

      const learnedIds = learnedWordIds.map(item => item.uv_vocabularyId);

      let queryBuilder = this.vocabularyRepository
        .createQueryBuilder('v')
        .take(limit);

      if (learnedIds.length > 0) {
        queryBuilder = queryBuilder.where('v.id NOT IN (:...learnedIds)', { learnedIds });
      }

      // Use ORDER BY id ASC instead of RANDOM() for SQLite compatibility
      const words = await queryBuilder
        .orderBy('v.id', 'ASC')
        .getMany();

      // If we need randomization, shuffle the results in memory
      if (words.length > limit) {
        // Fisher-Yates shuffle algorithm
        for (let i = words.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [words[i], words[j]] = [words[j], words[i]];
        }
        return words.slice(0, limit);
      }

      return words;
    } catch (error) {
      console.error('Error in getNewWordsForLearning:', error);
      throw error;
    }
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

  // Generate test questions (with mode and input type selection)
  async generateTest(userId: number, count: number = 10, mode: 'en-to-vi' | 'vi-to-en' | 'mixed' = 'mixed', inputType: 'multiple-choice' | 'text-input' | 'mixed' = 'multiple-choice') {
    // Get learned words for test
    const learnedWords = await this.userVocabularyRepository.find({
      where: { userId },
      relations: ['vocabulary'],
      take: count * 2, // Get more to have variety
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
            hints: [
              `Từ loại: ${word.partOfSpeech || 'không xác định'}`,
              `Độ khó: ${word.level || 'trung bình'}`,
            ]
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
            hints: [
              `Từ loại: ${word.partOfSpeech || 'không xác định'}`,
              `Độ khó: ${word.level || 'trung bình'}`,
            ]
          });
        }
      } else {
        // Multiple choice questions (existing logic)
        if (questionType === 'en-to-vi') {
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
          const wrongAnswers = await this.vocabularyRepository
            .createQueryBuilder('v')
            .where('v.id != :correctId', { correctId: word.id })
            .orderBy('RANDOM()')
            .take(3)
            .getMany();

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

  // Get new words for learning by topic
  async getNewWordsForLearningByTopic(userId: number, topic: string, limit: number = 10) {
    // Get words user hasn't learned yet in specific topic
    const learnedWordIds = await this.userVocabularyRepository
      .createQueryBuilder('uv')
      .select('uv.vocabularyId')
      .where('uv.userId = :userId', { userId })
      .getRawMany();

    const learnedIds = learnedWordIds.map(item => item.uv_vocabularyId);

    const queryBuilder = this.vocabularyRepository
      .createQueryBuilder('v')
      .where('v.topic = :topic', { topic })
      .take(limit)
      .orderBy('RANDOM()');

    if (learnedIds.length > 0) {
      queryBuilder.andWhere('v.id NOT IN (:...learnedIds)', { learnedIds });
    }

    return await queryBuilder.getMany();
  }

  // Get words for review by topic
  async getWordsForReviewByTopic(userId: number, topic: string, limit: number = 20) {
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
    }).then(results =>
      results.filter(uv => uv.vocabulary.topic === topic)
    );
  }

  // Generate test by topic
  async generateTestByTopic(userId: number, topic: string, count: number = 10, mode: 'en-to-vi' | 'vi-to-en' | 'mixed' = 'mixed', inputType: 'multiple-choice' | 'text-input' | 'mixed' = 'multiple-choice') {
    // Get learned words for test in specific topic
    const learnedWords = await this.userVocabularyRepository.find({
      where: { userId },
      relations: ['vocabulary'],
      take: count * 2,
      order: { lastReviewedAt: 'DESC' },
    });

    // Filter by topic
    const topicWords = learnedWords.filter(uv => uv.vocabulary.topic === topic);

    if (topicWords.length === 0) {
      return [];
    }

    // Use existing generateTest logic but with filtered words
    return this.generateTestQuestions(topicWords.slice(0, count), mode, inputType);
  }

  // Get user progress by topic
  async getUserProgressByTopic(userId: number, topic: string) {
    const topicWords = await this.userVocabularyRepository.find({
      where: { userId },
      relations: ['vocabulary'],
    });

    const filteredWords = topicWords.filter(uv => uv.vocabulary.topic === topic);

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

  // Helper method to generate test questions (extracted from generateTest)
  private async generateTestQuestions(userVocabs: any[], mode: string, inputType: string) {
    const testQuestions = [];

    for (let i = 0; i < userVocabs.length; i++) {
      const userVocab = userVocabs[i];
      const word = userVocab.vocabulary;

      // Determine question type based on mode
      let questionType: 'en-to-vi' | 'vi-to-en';
      if (mode === 'mixed') {
        questionType = Math.random() > 0.5 ? 'en-to-vi' : 'vi-to-en';
      } else {
        questionType = mode as 'en-to-vi' | 'vi-to-en';
      }

      // Determine input type
      let currentInputType: 'multiple-choice' | 'text-input';
      if (inputType === 'mixed') {
        currentInputType = Math.random() > 0.5 ? 'multiple-choice' : 'text-input';
      } else {
        currentInputType = inputType as 'multiple-choice' | 'text-input';
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
            topic: word.topic,
            hints: [
              `Chủ đề: ${word.topic || 'không xác định'}`,
              `Từ loại: ${word.partOfSpeech || 'không xác định'}`,
              `Độ khó: ${word.level || 'trung bình'}`,
            ]
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
            topic: word.topic,
            hints: [
              `Chủ đề: ${word.topic || 'không xác định'}`,
              `Từ loại: ${word.partOfSpeech || 'không xác định'}`,
              `Độ khó: ${word.level || 'trung bình'}`,
            ]
          });
        }
      } else {
        // Multiple choice questions - get wrong answers from same topic when possible
        const wrongAnswers = await this.vocabularyRepository
          .createQueryBuilder('v')
          .where('v.id != :correctId', { correctId: word.id })
          .andWhere('v.topic = :topic', { topic: word.topic })
          .orderBy('RANDOM()')
          .take(3)
          .getMany();

        // If not enough wrong answers from same topic, get from any topic
        if (wrongAnswers.length < 3) {
          const additionalWrong = await this.vocabularyRepository
            .createQueryBuilder('v')
            .where('v.id != :correctId', { correctId: word.id })
            .orderBy('RANDOM()')
            .take(3 - wrongAnswers.length)
            .getMany();
          wrongAnswers.push(...additionalWrong);
        }

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
            topic: word.topic,
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
            topic: word.topic,
          });
        }
      }
    }

    return testQuestions;
  }
}
