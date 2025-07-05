import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vocabulary } from '../database/entities/vocabulary.entity';
import { UserVocabulary, LearningStatus } from '../database/entities/user-vocabulary.entity';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class VocabularyService {
  constructor(
    @InjectRepository(Vocabulary)
    private vocabularyRepository: Repository<Vocabulary>,
    @InjectRepository(UserVocabulary)
    private userVocabularyRepository: Repository<UserVocabulary>,
    private redisService: RedisService,
  ) {}

  async findAll(page: number = 1, limit: number = 20) {
    // Cache key for paginated vocabulary list
    const cacheKey = `vocabulary:all:page:${page}:limit:${limit}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return cached;
    }

    const [vocabularies, total] = await this.vocabularyRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const result = {
      vocabularies,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };

    // Cache for 5 minutes
    await this.redisService.set(cacheKey, result, 300);
    return result;
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

  // Get all available topics with pagination - UPDATED to use topics table
  async getTopics(page: number = 1, limit: number = 20, level?: string) {
    const offset = (page - 1) * limit;

    // Build queries for parallel execution using topics table
    let topicsQuery = this.vocabularyRepository
      .createQueryBuilder('vocabulary')
      .innerJoin('vocabulary.topicEntity', 'topic')
      .select('topic.id', 'id')
      .addSelect('topic.name', 'name')
      .addSelect('topic.nameVi', 'nameVi')
      .addSelect('topic.description', 'description')
      .addSelect('topic.descriptionVi', 'descriptionVi')
      .addSelect('topic.icon', 'icon')
      .addSelect('COUNT(vocabulary.id)', 'count')
      .where('topic.isActive = :isActive', { isActive: true });

    let totalQuery = this.vocabularyRepository
      .createQueryBuilder('vocabulary')
      .innerJoin('vocabulary.topicEntity', 'topic')
      .select('COUNT(DISTINCT topic.id)', 'total')
      .where('topic.isActive = :isActive', { isActive: true });

    // Add level filter if provided
    if (level) {
      topicsQuery = topicsQuery.andWhere('vocabulary.level = :level', { level });
      totalQuery = totalQuery.andWhere('vocabulary.level = :level', { level });
    }

    // Execute both queries in parallel
    const [topics, totalTopics] = await Promise.all([
      topicsQuery
        .groupBy('topic.id')
        .addGroupBy('topic.name')
        .addGroupBy('topic.nameVi')
        .addGroupBy('topic.description')
        .addGroupBy('topic.descriptionVi')
        .addGroupBy('topic.icon')
        .orderBy('COUNT(vocabulary.id)', 'DESC')
        .addOrderBy('topic.name', 'ASC')
        .offset(offset)
        .limit(limit)
        .getRawMany(),

      totalQuery.getRawOne()
    ]);

    return {
      topics: topics.map(t => ({
        id: t.id,
        name: t.name,
        nameVi: t.nameVi,
        description: t.description,
        descriptionVi: t.descriptionVi,
        icon: t.icon,
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
    // Cache key for topic stats with longer TTL for Oregon latency
    const cacheKey = `topic:stats:page:${page}:limit:${limit}:level:${level || 'all'}`;
    const cached = await this.redisService.getTopicStats();

    if (cached && cached.page === page && cached.limit === limit && cached.level === level) {
      return cached;
    }

    const result = await this.getTopics(page, limit, level);

    // Cache topic stats for 20 minutes (longer for Oregon deployment)
    await this.redisService.setTopicStats(result, 1200);
    return result;
  }


  // Find vocabulary by topic and word (exact match) - UPDATED to use topicId
  async findByTopicAndWord(topicName: string, word: string, level?: string) {
    let query = this.vocabularyRepository
      .createQueryBuilder('vocabulary')
      .innerJoin('vocabulary.topicEntity', 'topic')
      .where('topic.name = :topicName', { topicName })
      .andWhere('vocabulary.word = :word', { word });

    if (level) {
      query = query.andWhere('vocabulary.level = :level', { level });
    }

    return await query.getOne();
  }

  // Find vocabulary by topic ID

  // Search words by topic ID
  async searchWordsByTopicId(topicId: number, word: string, limit: number = 10, level?: string) {
    let query = this.vocabularyRepository
      .createQueryBuilder('v')
      .where('v.topicId = :topicId', { topicId })
      .andWhere('(v.word ILIKE :word OR v.meaning ILIKE :word)', { word: `%${word}%` });

    if (level) {
      query = query.andWhere('v.level = :level', { level });
    }

    return await query
      .orderBy('v.word', 'ASC')
      .take(limit)
      .getMany();
  }
}
