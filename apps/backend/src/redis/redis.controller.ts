import { Controller, Get, Post, Body } from '@nestjs/common';
import { RedisService } from './redis.service';

@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @Get('test')
  async testRedis() {
    try {
      // Test basic get/set
      const testKey = 'test:connection';
      const testData = { message: 'Redis is working!', timestamp: new Date() };

      console.log('🧪 Testing Redis connection...');

      // Set test data
      await this.redisService.set(testKey, testData, 60);

      // Get test data
      const result = await this.redisService.get(testKey);

      return {
        success: true,
        message: 'Redis connection successful',
        testData: result,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Redis test failed:', error);
      return {
        success: false,
        message: 'Redis connection failed',
        error: error.message,
        timestamp: new Date()
      };
    }
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
  async getTestData(@Body() body: { key: string }) {
    try {
      const result = await this.redisService.get(body.key);
      return {
        success: true,
        key: body.key,
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
}
