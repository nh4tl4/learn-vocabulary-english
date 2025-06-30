import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  // Topic stats caching
  async getTopicStats(): Promise<any> {
    console.log('🔍 Getting topic stats from cache...');
    const result = await this.cacheManager.get('topic:stats');
    console.log('🔍 Topic stats cache result:', result ? 'HIT' : 'MISS');
    return result;
  }

  async setTopicStats(data: any, ttl: number = 300): Promise<void> {
    console.log('💾 Setting topic stats to cache, TTL:', ttl);
    await this.cacheManager.set('topic:stats', data, ttl);
    console.log('💾 Topic stats cached successfully');
  }

  // User selected topics caching
  async getUserSelectedTopics(userId: number): Promise<any> {
    const cacheKey = `user:${userId}:selected-topics`;
    console.log('🔍 Getting user selected topics from cache, key:', cacheKey);
    const result = await this.cacheManager.get(cacheKey);
    console.log('🔍 User selected topics cache result:', result ? 'HIT' : 'MISS');
    return result;
  }

  async setUserSelectedTopics(userId: number, topics: string[], ttl: number = 1800): Promise<void> {
    const cacheKey = `user:${userId}:selected-topics`;
    console.log('💾 Setting user selected topics to cache, key:', cacheKey, 'topics:', topics);
    await this.cacheManager.set(cacheKey, topics, ttl);
    console.log('💾 User selected topics cached successfully');
  }

  async clearUserSelectedTopics(userId: number): Promise<void> {
    const cacheKey = `user:${userId}:selected-topics`;
    console.log('🗑️ Clearing user selected topics cache, key:', cacheKey);
    await this.cacheManager.del(cacheKey);
    console.log('🗑️ User selected topics cache cleared');
  }

  // Vocabulary by topic caching
  async getVocabularyByTopic(cacheKey: string): Promise<any> {
    console.log('🔍 Getting vocabulary by topic from cache, key:', cacheKey);
    const result = await this.cacheManager.get(cacheKey);
    console.log('🔍 Vocabulary by topic cache result:', result ? 'HIT' : 'MISS');
    return result;
  }

  async setVocabularyByTopic(cacheKey: string, data: any, ttl: number = 600): Promise<void> {
    console.log('💾 Setting vocabulary by topic to cache, key:', cacheKey, 'TTL:', ttl);
    await this.cacheManager.set(cacheKey, data, ttl);
    console.log('💾 Vocabulary by topic cached successfully');
  }

  // User progress caching
  async getUserProgress(userId: number): Promise<any> {
    const cacheKey = `user:${userId}:progress`;
    console.log('🔍 Getting user progress from cache, key:', cacheKey);
    const result = await this.cacheManager.get(cacheKey);
    console.log('🔍 User progress cache result:', result ? 'HIT' : 'MISS');
    return result;
  }

  async setUserProgress(userId: number, progress: any, ttl: number = 900): Promise<void> {
    const cacheKey = `user:${userId}:progress`;
    console.log('💾 Setting user progress to cache, key:', cacheKey, 'TTL:', ttl);
    await this.cacheManager.set(cacheKey, progress, ttl);
    console.log('💾 User progress cached successfully');
  }

  // Generic cache methods
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      console.log('💾 Setting to cache, key:', key, 'TTL:', ttl);
      console.log('💾 Value to cache:', JSON.stringify(value));
      await this.cacheManager.set(key, value, ttl);
      console.log('💾 Cache set successfully');
    } catch (error) {
      console.error('❌ Cache set error:', error);
    }
  }

  async get(key: string): Promise<any> {
    try {
      console.log('🔍 Getting from cache, key:', key);
      const result = await this.cacheManager.get(key);
      console.log('🔍 Cache get result:', result ? 'HIT' : 'MISS');
      return result;
    } catch (error) {
      console.error('❌ Cache get error:', error);
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      console.log('🗑️ Deleting from cache, key:', key);
      await this.cacheManager.del(key);
      console.log('🗑️ Cache delete successful');
    } catch (error) {
      console.error('❌ Cache delete error:', error);
    }
  }

  // Debug method to test Redis connection
  async testRedisConnection(): Promise<any> {
    try {
      console.log('🧪 Testing Redis connection...');

      // Set a test value
      const testKey = 'redis:test:' + Date.now();
      const testValue = { test: true, timestamp: new Date().toISOString() };

      console.log('🧪 Setting test value, key:', testKey);
      await this.cacheManager.set(testKey, testValue, 60); // 1 minute TTL

      // Get the test value
      console.log('🧪 Getting test value...');
      const result = await this.cacheManager.get(testKey);

      // Check if Redis store is being used
      const store = (this.cacheManager as any).store;
      const storeInfo = {
        name: store?.constructor?.name || 'unknown',
        isRedis: store?.constructor?.name?.includes('Redis') || false,
        hasRedisClient: !!(store?.client || store?.redisClient),
      };

      console.log('🧪 Cache store info:', storeInfo);
      console.log('🧪 Test result:', result);

      return {
        connectionTest: result ? 'SUCCESS' : 'FAILED',
        testKey,
        testValue,
        retrievedValue: result,
        storeInfo,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Redis connection test failed:', error);
      return {
        connectionTest: 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}
