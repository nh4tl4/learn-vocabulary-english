import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from './redis.decorators';
import { RedisClientType } from 'redis';

interface RedisConnection extends RedisClientType {}

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(
    @InjectRedis() private readonly redisClient: RedisConnection,
  ) {}

  // Enhanced cache operation with better error handling
  private async safeOperation<T>(
    operation: () => Promise<T>,
    operationType: string,
    key?: string
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      this.logger.error(`❌ ${operationType} failed for key: ${key}`, error.stack);
      return null;
    }
  }

  // Topic stats caching using Redis hSet for structured data
  async getTopicStats(): Promise<any> {
    this.logger.log('🔍 Getting topic stats from Redis hash...');
    const result = await this.safeOperation(
      () => this.redisClient.hGet('topic:stats', 'data'),
      'Get topic stats',
      'topic:stats'
    );

    if (result) {
      this.logger.log('🔍 Topic stats cache result: HIT');
      try {
        return JSON.parse(result);
      } catch {
        this.logger.error('❌ Failed to parse cached topic stats');
        return null;
      }
    }

    this.logger.log('🔍 Topic stats cache result: MISS');
    return null;
  }

  async setTopicStats(data: any, ttl: number = 1200): Promise<boolean> {
    this.logger.log(`💾 Setting topic stats to Redis hash, TTL: ${ttl}s`);
    const success = await this.safeOperation(
      async () => {
        // Store the entire data as a single JSON string
        const serializedData = JSON.stringify(data);
        await this.redisClient.hSet('topic:stats', 'data', serializedData);
        // Set expiration
        await this.redisClient.expire('topic:stats', ttl);
        return true;
      },
      'Set topic stats',
      'topic:stats'
    );

    if (success) {
      this.logger.log('💾 Topic stats cached successfully using hSet');
      return true;
    }
    return false;
  }

  // User selected topics using Redis Sets for better performance
  async getUserSelectedTopics(userId: number): Promise<string[]> {
    const cacheKey = `user:${userId}:selected-topics`;
    this.logger.log(`🔍 Getting user selected topics from Redis set, key: ${cacheKey}`);

    const result = await this.safeOperation(
      () => this.redisClient.sMembers(cacheKey),
      'Get user selected topics',
      cacheKey
    );

    if (result && result.length > 0) {
      this.logger.log('🔍 User selected topics cache result: HIT');
      return result;
    }

    this.logger.log('🔍 User selected topics cache result: MISS');
    return [];
  }

  async setUserSelectedTopics(userId: number, topics: string[], ttl: number = 1800): Promise<boolean> {
    const cacheKey = `user:${userId}:selected-topics`;
    this.logger.log(`💾 Setting user selected topics to Redis set, key: ${cacheKey}, topics:`, topics);

    const success = await this.safeOperation(
      async () => {
        // Clear existing set
        await this.redisClient.del(cacheKey);

        if (topics.length > 0) {
          // Add topics to set
          await this.redisClient.sAdd(cacheKey, topics);
        }

        // Set expiration
        await this.redisClient.expire(cacheKey, ttl);
        return true;
      },
      'Set user selected topics',
      cacheKey
    );

    if (success) {
      this.logger.log('💾 User selected topics cached successfully using sAdd');
      return true;
    }
    return false;
  }

  async clearUserSelectedTopics(userId: number): Promise<boolean> {
    const cacheKey = `user:${userId}:selected-topics`;
    this.logger.log(`🗑️ Clearing user selected topics set, key: ${cacheKey}`);

    const success = await this.safeOperation(
      () => this.redisClient.del(cacheKey),
      'Clear user selected topics',
      cacheKey
    );

    if (success) {
      this.logger.log('🗑️ User selected topics cache cleared');
      return true;
    }
    return false;
  }

  // Enhanced vocabulary caching with Redis hSet for complex data
  async getVocabularyByTopic(topic: string, page: number = 1, level?: string): Promise<any> {
    const cacheKey = `vocab:topic:${topic}:page:${page}${level ? `:level:${level}` : ''}`;
    this.logger.log(`🔍 Getting vocabulary by topic from Redis hash, key: ${cacheKey}`);

    const result = await this.safeOperation(
      () => this.redisClient.hGetAll(cacheKey),
      'Get vocabulary by topic',
      cacheKey
    );

    if (result && Object.keys(result).length > 0) {
      this.logger.log('🔍 Vocabulary by topic cache result: HIT');
      // Parse vocabulary data
      const parsedResult = {};
      for (const [key, value] of Object.entries(result)) {
        try {
          parsedResult[key] = JSON.parse(value as string);
        } catch {
          parsedResult[key] = value;
        }
      }
      return parsedResult;
    }

    this.logger.log('🔍 Vocabulary by topic cache result: MISS');
    return null;
  }

  async setVocabularyByTopic(topic: string, data: any, page: number = 1, level?: string, ttl: number = 600): Promise<boolean> {
    const cacheKey = `vocab:topic:${topic}:page:${page}${level ? `:level:${level}` : ''}`;
    this.logger.log(`💾 Setting vocabulary by topic to Redis hash, key: ${cacheKey}, TTL: ${ttl}s`);

    const success = await this.safeOperation(
      async () => {
        // Convert data to hash format
        const hashData = {};
        for (const [key, value] of Object.entries(data)) {
          hashData[key] = typeof value === 'object' ? JSON.stringify(value) : value;
        }

        await this.redisClient.hSet(cacheKey, hashData);
        await this.redisClient.expire(cacheKey, ttl);
        return true;
      },
      'Set vocabulary by topic',
      cacheKey
    );

    if (success) {
      this.logger.log('💾 Vocabulary by topic cached successfully using hSet');
      return true;
    }
    return false;
  }

  // User progress using Redis hSet for structured progress data
  async getUserProgress(userId: number, version: string = 'v1'): Promise<any> {
    const cacheKey = `user:${userId}:progress:${version}`;
    this.logger.log(`🔍 Getting user progress from Redis hash, key: ${cacheKey}`);

    const result = await this.safeOperation(
      () => this.redisClient.hGetAll(cacheKey),
      'Get user progress',
      cacheKey
    );

    if (result && Object.keys(result).length > 0) {
      this.logger.log('🔍 User progress cache result: HIT');
      // Parse progress data
      const parsedResult = {};
      for (const [key, value] of Object.entries(result)) {
        try {
          parsedResult[key] = JSON.parse(value as string);
        } catch {
          parsedResult[key] = value;
        }
      }
      return parsedResult;
    }

    this.logger.log('🔍 User progress cache result: MISS');
    return null;
  }

  async setUserProgress(userId: number, progress: any, version: string = 'v1', ttl: number = 900): Promise<boolean> {
    const cacheKey = `user:${userId}:progress:${version}`;
    this.logger.log(`💾 Setting user progress to Redis hash, key: ${cacheKey}, TTL: ${ttl}s`);

    const success = await this.safeOperation(
      async () => {
        // Convert progress to hash format
        const hashData = {};
        for (const [key, value] of Object.entries(progress)) {
          hashData[key] = typeof value === 'object' ? JSON.stringify(value) : value;
        }

        await this.redisClient.hSet(cacheKey, hashData);
        await this.redisClient.expire(cacheKey, ttl);
        return true;
      },
      'Set user progress',
      cacheKey
    );

    if (success) {
      this.logger.log('💾 User progress cached successfully using hSet');
      return true;
    }
    return false;
  }

  // Enhanced generic cache methods using Redis native commands
  async set(key: string, value: any, ttl: number = 300): Promise<boolean> {
    this.logger.log(`💾 Setting to Redis, key: ${key}, TTL: ${ttl}s`);
    this.logger.debug(`💾 Value to cache:`, JSON.stringify(value).substring(0, 200) + '...');

    const success = await this.safeOperation(
      async () => {
        const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
        await this.redisClient.setEx(key, ttl, serializedValue);
        return true;
      },
      'Set cache',
      key
    );

    return success !== null;
  }

  async get(key: string): Promise<any> {
    this.logger.log(`🔍 Getting from Redis, key: ${key}`);

    const result = await this.safeOperation(
      () => this.redisClient.get(key),
      'Get cache',
      key
    );

    if (result) {
      this.logger.log('🔍 Cache get result: HIT');
      try {
        return JSON.parse(result);
      } catch {
        return result;
      }
    }

    this.logger.log('🔍 Cache get result: MISS');
    return null;
  }

  async delete(key: string): Promise<boolean> {
    this.logger.log(`🗑️ Deleting from Redis, key: ${key}`);

    const success = await this.safeOperation(
      async () => {
        const result = await this.redisClient.del(key);
        return result > 0;
      },
      'Delete cache',
      key
    );

    return success !== null && success;
  }

  // Pattern-based operations using Redis SCAN
  async deletePattern(pattern: string): Promise<boolean> {
    try {
      this.logger.log(`🗑️ Deleting Redis keys by pattern: ${pattern}`);

      const keys = await this.redisClient.keys(pattern);
      if (keys.length > 0) {
        await this.redisClient.del(keys);
        this.logger.log(`🗑️ Deleted ${keys.length} keys matching pattern: ${pattern}`);
        return true;
      }

      this.logger.log(`🗑️ No keys found matching pattern: ${pattern}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Pattern deletion failed for: ${pattern}`, error.stack);
      return false;
    }
  }

  // Enhanced Redis connection test using native Redis commands
  async testRedisConnection(): Promise<any> {
    try {
      this.logger.log('🧪 Testing Redis connection...');

      const testKey = `redis:test:${Date.now()}`;
      const testValue = {
        test: true,
        timestamp: new Date().toISOString(),
        random: Math.random()
      };

      this.logger.log(`🧪 Setting test value using hSet, key: ${testKey}`);
      await this.redisClient.hSet(testKey, 'data', JSON.stringify(testValue));
      await this.redisClient.expire(testKey, 60);

      this.logger.log('🧪 Getting test value using hGet...');
      const result = await this.redisClient.hGet(testKey, 'data');
      const parsedResult = result ? JSON.parse(result) : null;

      // Redis client info
      const clientInfo = {
        isConnected: this.redisClient.isOpen,
      };

      this.logger.log('🧪 Redis client info:', clientInfo);
      this.logger.log('🧪 Test result:', parsedResult ? 'SUCCESS' : 'FAILED');

      // Clean up test key
      await this.redisClient.del(testKey);

      return {
        connectionTest: parsedResult && JSON.stringify(parsedResult) === JSON.stringify(testValue) ? 'SUCCESS' : 'FAILED',
        testKey,
        testValue,
        retrievedValue: parsedResult,
        clientInfo,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('❌ Redis connection test failed:', error.stack);
      return {
        connectionTest: 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Redis-specific operations
  async ping(): Promise<string> {
    return await this.redisClient.ping();
  }

  async info(): Promise<string> {
    return await this.redisClient.info();
  }

  async flushdb(): Promise<string> {
    this.logger.warn('🗑️ Flushing current Redis database');
    return await this.redisClient.flushDb();
  }

  // Cache statistics using Redis INFO command
  async getCacheStats(): Promise<any> {
    try {
      const info = await this.redisClient.info('memory');
      const keyspace = await this.redisClient.info('keyspace');

      return {
        storeType: 'redis-node',
        isRedis: true,
        hasClient: true,
        isConnected: this.redisClient.isOpen,
        memory: this.parseRedisInfo(info),
        keyspace: this.parseRedisInfo(keyspace),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('❌ Failed to get Redis stats:', error.stack);
      return {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  private parseRedisInfo(info: string): any {
    const result = {};
    info.split('\n').forEach(line => {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        result[key.trim()] = value.trim();
      }
    });
    return result;
  }
}
