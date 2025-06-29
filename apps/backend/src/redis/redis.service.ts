import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  // Vocabulary caching
  async getVocabularyByTopic(topic: string): Promise<any> {
    const cacheKey = `vocabulary:topic:${topic}`;
    return await this.cacheManager.get(cacheKey);
  }

  async setVocabularyByTopic(topic: string, data: any, ttl: number = 600): Promise<void> {
    const cacheKey = `vocabulary:topic:${topic}`;
    await this.cacheManager.set(cacheKey, data, ttl);
  }

  // Topic stats caching
  async getTopicStats(): Promise<any> {
    return await this.cacheManager.get('topic:stats');
  }

  async setTopicStats(data: any, ttl: number = 300): Promise<void> {
    await this.cacheManager.set('topic:stats', data, ttl);
  }

  // User selected topics caching
  async getUserSelectedTopics(userId: number): Promise<any> {
    const cacheKey = `user:${userId}:selected-topics`;
    return await this.cacheManager.get(cacheKey);
  }

  async setUserSelectedTopics(userId: number, topics: string[], ttl: number = 1800): Promise<void> {
    const cacheKey = `user:${userId}:selected-topics`;
    await this.cacheManager.set(cacheKey, topics, ttl);
  }

  async clearUserSelectedTopics(userId: number): Promise<void> {
    const cacheKey = `user:${userId}:selected-topics`;
    await this.cacheManager.del(cacheKey);
  }

  // Learning progress caching
  async getUserProgress(userId: number): Promise<any> {
    const cacheKey = `user:${userId}:progress`;
    return await this.cacheManager.get(cacheKey);
  }

  async setUserProgress(userId: number, progress: any, ttl: number = 900): Promise<void> {
    const cacheKey = `user:${userId}:progress`;
    await this.cacheManager.set(cacheKey, progress, ttl);
  }

  // Generic cache methods
  async get(key: string): Promise<any> {
    return await this.cacheManager.get(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async clear(): Promise<void> {
    // Use del to clear all keys or implement specific cache clearing logic
    // For now, we'll remove this method or implement it differently
    console.warn('Cache clear method called - implement specific key clearing if needed');
  }
}
