import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vocabulary } from '../database/entities/vocabulary.entity';
import { UserVocabulary, LearningStatus } from '../database/entities/user-vocabulary.entity';

@Injectable()
export class VocabularyService {
  constructor(
    @InjectRepository(Vocabulary)
    private vocabularyRepository: Repository<Vocabulary>,
    @InjectRepository(UserVocabulary)
    private userVocabularyRepository: Repository<UserVocabulary>,
  ) {}

  async findAll(page: number = 1, limit: number = 20) {
    const [vocabularies, total] = await this.vocabularyRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      vocabularies,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findRandom(count: number = 10) {
    return await this.vocabularyRepository
      .createQueryBuilder('vocabulary')
      .orderBy('RANDOM()')
      .limit(count)
      .getMany();
  }

  async findOne(id: number) {
    return await this.vocabularyRepository.findOne({ where: { id } });
  }

  async create(vocabularyData: any) {
    const vocabulary = this.vocabularyRepository.create(vocabularyData);
    return await this.vocabularyRepository.save(vocabulary);
  }

  async getUserProgress(userId: number) {
    const userVocabularies = await this.userVocabularyRepository.find({
      where: { userId },
      relations: ['vocabulary'],
      order: { lastReviewedAt: 'DESC' },
    });

    return userVocabularies.map(uv => ({
      vocabulary: uv.vocabulary,
      status: uv.status,
      correctCount: uv.correctCount,
      incorrectCount: uv.incorrectCount,
      accuracy: uv.accuracy,
      nextReviewDate: uv.nextReviewDate,
    }));
  }

  async updateProgress(userId: number, vocabularyId: number, isCorrect: boolean) {
    let userVocabulary = await this.userVocabularyRepository.findOne({
      where: { userId, vocabularyId },
    });

    if (!userVocabulary) {
      userVocabulary = this.userVocabularyRepository.create({
        userId,
        vocabularyId,
        status: LearningStatus.LEARNING,
        firstLearnedDate: new Date(),
      });
    }

    if (isCorrect) {
      userVocabulary.correctCount++;
      userVocabulary.status = LearningStatus.REVIEWING;
    } else {
      userVocabulary.incorrectCount++;
      userVocabulary.status = LearningStatus.DIFFICULT;
    }

    userVocabulary.lastReviewedAt = new Date();

    return await this.userVocabularyRepository.save(userVocabulary);
  }

  // Get all available topics
  async getTopics() {
    const topics = await this.vocabularyRepository
      .createQueryBuilder('vocabulary')
      .select('vocabulary.topic', 'topic')
      .addSelect('COUNT(*)', 'count')
      .where('vocabulary.topic IS NOT NULL')
      .groupBy('vocabulary.topic')
      .orderBy('COUNT(*)', 'DESC')
      .getRawMany();

    return topics.map(topic => ({
      name: topic.topic,
      count: parseInt(topic.count, 10)
    }));
  }

  // Get vocabulary by topic
  async findByTopic(topic: string, page: number = 1, limit: number = 20) {
    const [vocabularies, total] = await this.vocabularyRepository.findAndCount({
      where: { topic },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      vocabularies,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      topic,
    };
  }

  // Get topic statistics
  async getTopicStats() {
    const stats = await this.vocabularyRepository
      .createQueryBuilder('vocabulary')
      .select('vocabulary.topic', 'topic')
      .addSelect('COUNT(*)', 'totalWords')
      .addSelect('vocabulary.level', 'level')
      .where('vocabulary.topic IS NOT NULL')
      .groupBy('vocabulary.topic, vocabulary.level')
      .orderBy('vocabulary.topic, vocabulary.level')
      .getRawMany();

    // Group by topic
    const topicStats = {};
    stats.forEach(stat => {
      if (!topicStats[stat.topic]) {
        topicStats[stat.topic] = {
          topic: stat.topic,
          levels: {},
          totalWords: 0
        };
      }
      topicStats[stat.topic].levels[stat.level || 'unknown'] = parseInt(stat.totalWords, 10);
      topicStats[stat.topic].totalWords += parseInt(stat.totalWords, 10);
    });

    return Object.values(topicStats);
  }

  // Search words by topic and word pattern
  async searchWordsByTopic(topic: string, word: string, limit: number = 10) {
    return await this.vocabularyRepository
      .createQueryBuilder('vocabulary')
      .where('vocabulary.topic = :topic', { topic })
      .andWhere('vocabulary.word ILIKE :word', { word: `%${word}%` })
      .take(limit)
      .getMany();
  }

  // Find specific word by topic and word
  async findByTopicAndWord(topic: string, word: string) {
    return await this.vocabularyRepository.findOne({
      where: {
        topic,
        word: word.toLowerCase()
      }
    });
  }
}
