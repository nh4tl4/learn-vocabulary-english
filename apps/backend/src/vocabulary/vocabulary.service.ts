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

  // Get all available topics with pagination
  async getTopics(page: number = 1, limit: number = 20, level?: string) {
    const offset = (page - 1) * limit;

    let query = this.vocabularyRepository
      .createQueryBuilder('vocabulary')
      .select('vocabulary.topic', 'topic')
      .addSelect('vocabulary.topicVi', 'topicVi')  // Thêm topicVi vào response
      .addSelect('COUNT(*)', 'count')
      .where('vocabulary.topic IS NOT NULL');

    // Add level filter if provided
    if (level) {
      query = query.andWhere('vocabulary.level = :level', { level });
    }

    const topics = await query
      .groupBy('vocabulary.topic')
      .addGroupBy('vocabulary.topicVi')  // Group by topicVi cũng
      .orderBy('COUNT(*)', 'DESC')
      .addOrderBy('vocabulary.topic', 'ASC')
      .offset(offset)
      .limit(limit)
      .getRawMany();

    // Get total count of unique topics with level filter
    let totalQuery = this.vocabularyRepository
      .createQueryBuilder('vocabulary')
      .select('COUNT(DISTINCT vocabulary.topic)', 'total')
      .where('vocabulary.topic IS NOT NULL');

    if (level) {
      totalQuery = totalQuery.andWhere('vocabulary.level = :level', { level });
    }

    const totalTopics = await totalQuery.getRawOne();

    return {
      topics: topics.map(t => ({
        topic: t.topic,
        topicVi: t.topicVi,  // Thêm topicVi vào response
        count: parseInt(t.count)
      })),
      total: parseInt(totalTopics.total),
      page,
      totalPages: Math.ceil(parseInt(totalTopics.total) / limit),
      hasMore: page < Math.ceil(parseInt(totalTopics.total) / limit),
      level
    };
  }

  // Get topic stats with pagination (for backward compatibility)
  async getTopicStats(page: number = 1, limit: number = 20, level?: string) {
    return this.getTopics(page, limit, level);
  }

  // Find vocabulary by topic with pagination
  async findByTopic(topic: string, page: number = 1, limit: number = 20, level?: string) {
    const whereCondition: any = { topic };
    if (level) {
      whereCondition.level = level;
    }

    const [vocabularies, total] = await this.vocabularyRepository.findAndCount({
      where: whereCondition,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      vocabularies,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page < Math.ceil(total / limit),
      topic,
      level
    };
  }

  // Search words by topic with pagination
  async searchWordsByTopic(topic: string, word: string, limit: number = 10, level?: string) {
    let query = this.vocabularyRepository
      .createQueryBuilder('vocabulary')
      .where('vocabulary.topic = :topic', { topic })
      .andWhere('vocabulary.word ILIKE :word', { word: `%${word}%` });

    if (level) {
      query = query.andWhere('vocabulary.level = :level', { level });
    }

    return await query
      .orderBy('vocabulary.word', 'ASC')
      .limit(limit)
      .getMany();
  }

  // Find vocabulary by topic and word (exact match)
  async findByTopicAndWord(topic: string, word: string, level?: string) {
    const whereCondition: any = { topic, word };
    if (level) {
      whereCondition.level = level;
    }

    return await this.vocabularyRepository.findOne({
      where: whereCondition
    });
  }
}
