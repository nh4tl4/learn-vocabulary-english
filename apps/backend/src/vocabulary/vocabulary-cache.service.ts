import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vocabulary } from '../database/entities/vocabulary.entity';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class VocabularyCacheService {
  private readonly CACHE_PREFIX = 'vocab:';
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    @InjectRepository(Vocabulary)
    private vocabularyRepository: Repository<Vocabulary>,
    private redisService: RedisService,
  ) {}

  // Get vocabulary with caching by level
  async getVocabularyByLevel(level: string, limit: number = 10, offset: number = 0): Promise<Vocabulary[]> {
    const cacheKey = `${this.CACHE_PREFIX}level:${level}:${limit}:${offset}`;

    try {
      // Try to get from cache first
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Redis cache miss or error:', error.message);
    }

    // If not in cache, fetch from database
    const words = await this.vocabularyRepository
      .createQueryBuilder('v')
      .where('v.level = :level', { level })
      .orderBy('v.id', 'ASC')
      .skip(offset)
      .take(limit)
      .getMany();

    // Cache the result
    try {
      await this.redisService.set(cacheKey, JSON.stringify(words), this.CACHE_TTL);
    } catch (error) {
      console.warn('Failed to cache vocabulary:', error.message);
    }

    return words;
  }

  // Get vocabulary by topic with caching
  async getVocabularyByTopic(topic: string, level?: string, limit: number = 10): Promise<Vocabulary[]> {
    const cacheKey = `${this.CACHE_PREFIX}topic:${topic}:${level || 'all'}:${limit}`;

    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Redis cache miss or error:', error.message);
    }

    let queryBuilder = this.vocabularyRepository
      .createQueryBuilder('v')
      .where('v.topic = :topic', { topic });

    if (level) {
      queryBuilder = queryBuilder.andWhere('v.level = :level', { level });
    }

    const words = await queryBuilder
      .orderBy('v.id', 'ASC')
      .take(limit)
      .getMany();

    try {
      await this.redisService.set(cacheKey, JSON.stringify(words), this.CACHE_TTL);
    } catch (error) {
      console.warn('Failed to cache vocabulary:', error.message);
    }

    return words;
  }

  // Batch get vocabulary by IDs
  async getVocabularyByIds(ids: number[]): Promise<Vocabulary[]> {
    if (ids.length === 0) return [];

    const cacheKey = `${this.CACHE_PREFIX}batch:${ids.sort().join(',')}`;

    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Redis cache miss or error:', error.message);
    }

    const words = await this.vocabularyRepository
      .createQueryBuilder('v')
      .where('v.id IN (:...ids)', { ids })
      .getMany();

    try {
      await this.redisService.set(cacheKey, JSON.stringify(words), this.CACHE_TTL);
    } catch (error) {
      console.warn('Failed to cache vocabulary batch:', error.message);
    }

    return words;
  }

  // Clear cache for specific level
  async clearLevelCache(level: string): Promise<void> {
    try {
      // Since we can't use KEYS command, we'll clear specific known cache keys
      const cacheKeys = [
        `${this.CACHE_PREFIX}level:${level}:10:0`,
        `${this.CACHE_PREFIX}level:${level}:20:0`,
        `${this.CACHE_PREFIX}level:${level}:30:0`,
      ];

      for (const key of cacheKeys) {
        await this.redisService.delete(key);
      }
    } catch (error) {
      console.warn('Failed to clear level cache:', error.message);
    }
  }

  // Clear all vocabulary cache - simplified version
  async clearAllCache(): Promise<void> {
    try {
      // Clear common cache patterns manually since we can't use KEYS
      const levels = ['beginner', 'intermediate', 'advanced'];
      const limits = [10, 20, 30];

      for (const level of levels) {
        for (const limit of limits) {
          const key = `${this.CACHE_PREFIX}level:${level}:${limit}:0`;
          await this.redisService.delete(key);
        }
      }
    } catch (error) {
      console.warn('Failed to clear all vocabulary cache:', error.message);
    }
  }
}
