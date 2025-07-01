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

  // Batch get vocabulary by IDs - OPTIMIZED
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

    // Use IN clause for better performance with large ID lists
    const words = await this.vocabularyRepository
      .createQueryBuilder('v')
      .where('v.id IN (:...ids)', { ids })
      .orderBy('v.id', 'ASC')
      .getMany();

    try {
      await this.redisService.set(cacheKey, JSON.stringify(words), this.CACHE_TTL);
    } catch (error) {
      console.warn('Failed to cache vocabulary:', error.message);
    }

    return words;
  }

  // Preload vocabulary cache for faster access - OPTIMIZED with Promise.all
  async preloadVocabularyCache(levels: string[] = ['beginner', 'intermediate', 'advanced']): Promise<void> {
    console.log('🚀 Starting vocabulary cache preload...');

    try {
      // Preload all levels in parallel for maximum efficiency
      await Promise.all(
        levels.map(async (level) => {
          const cachePromises = [];

          // Preload first 3 pages for each level
          for (let i = 0; i < 3; i++) {
            const offset = i * 50;
            cachePromises.push(this.getVocabularyByLevel(level, 50, offset));
          }

          await Promise.all(cachePromises);
          console.log(`✅ Preloaded cache for level: ${level}`);
        })
      );

      console.log('🎉 Vocabulary cache preload completed successfully!');
    } catch (error) {
      console.error('❌ Failed to preload vocabulary cache:', error);
    }
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

  // Clear cache for specific patterns
  async clearCache(pattern?: string): Promise<void> {
    try {
      if (pattern) {
        // Clear specific pattern
        await this.redisService.delete(`${this.CACHE_PREFIX}${pattern}`);
      } else {
        // Clear all vocabulary cache (implementation depends on Redis service)
        console.log('Clearing all vocabulary cache...');
      }
    } catch (error) {
      console.warn('Failed to clear cache:', error.message);
    }
  }
}
