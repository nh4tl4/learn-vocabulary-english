import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RedisService } from './redis.service';

@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @Get('test')
  async testConnection() {
    return await this.redisService.testRedisConnection();
  }

  @Post('set')
  async setTestData(@Body() body: { key: string; value: any; ttl?: number }) {
    try {
      await this.redisService.set(body.key, body.value, body.ttl || 300);
      return {
        success: true,
        message: `Data set for key: ${body.key}`,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to set data',
        error: error.message
      };
    }
  }

  @Get('get/:key')
  async getTestData(@Param('key') key: string) {
    try {
      const result = await this.redisService.get(key);
      return {
        success: true,
        key: key,
        data: result,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get data',
        error: error.message
      };
    }
  }

  @Get('debug/info')
  async getDebugInfo() {
    console.log('🔍 Getting Redis debug info...');

    const testResult = await this.redisService.testRedisConnection();

    // Try to get some current cache values
    const topicStats = await this.redisService.getTopicStats();
    const userTopics = await this.redisService.getUserSelectedTopics(1);

    return {
      redisTest: testResult,
      currentCache: {
        topicStats: topicStats ? 'HAS_DATA' : 'NO_DATA',
        userTopics: userTopics ? 'HAS_DATA' : 'NO_DATA'
      },
      timestamp: new Date().toISOString()
    };
  }
}
