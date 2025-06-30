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

  @Get('debug/keys')
  async getAllKeys() {
    try {
      // Try to access the Redis client directly
      const cacheManager = (this.redisService as any).cacheManager;
      const store = cacheManager?.store;

      console.log('🔍 Checking Redis store type:', store?.constructor?.name);
      console.log('🔍 Store details:', {
        hasClient: !!(store?.client),
        hasRedisClient: !!(store?.redisClient),
        storeType: store?.constructor?.name,
        storeMethods: Object.getOwnPropertyNames(store || {})
      });

      // Try multiple ways to access Redis client
      let client = null;
      if (store?.client) {
        client = store.client;
        console.log('🔍 Using store.client');
      } else if (store?.redisClient) {
        client = store.redisClient;
        console.log('🔍 Using store.redisClient');
      } else if (store?._client) {
        client = store._client;
        console.log('🔍 Using store._client');
      }

      if (client) {
        console.log('🔍 Found Redis client, getting all keys...');

        // Try different methods to get keys
        let keys = [];
        try {
          if (typeof client.keys === 'function') {
            keys = await client.keys('*');
          } else if (typeof client.scan === 'function') {
            // Use SCAN if KEYS is not available
            const result = await client.scan(0);
            keys = result.keys || result[1] || [];
          }
        } catch (keyError) {
          console.error('❌ Error getting keys:', keyError.message);
          return {
            success: false,
            error: `Error getting keys: ${keyError.message}`,
            storeType: store?.constructor?.name,
            clientMethods: Object.getOwnPropertyNames(client),
            timestamp: new Date().toISOString()
          };
        }

        console.log('🔍 Redis keys found:', keys);

        // Get values for each key
        const keyValues = {};
        for (const key of keys) {
          try {
            let value;
            if (typeof client.get === 'function') {
              value = await client.get(key);
            }

            // Try to parse JSON
            try {
              keyValues[key] = value ? JSON.parse(value) : value;
            } catch (parseError) {
              keyValues[key] = value; // Keep as string if not JSON
            }
          } catch (e) {
            keyValues[key] = `Error getting value: ${e.message}`;
          }
        }

        return {
          success: true,
          totalKeys: keys.length,
          keys: keys,
          keyValues: keyValues,
          storeType: store?.constructor?.name,
          clientType: client?.constructor?.name,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          success: false,
          message: 'Redis client not accessible - likely using in-memory store',
          storeType: store?.constructor?.name || 'unknown',
          storeDetails: {
            hasStore: !!store,
            storeMethods: store ? Object.getOwnPropertyNames(store) : [],
            storePrototype: store ? Object.getOwnPropertyNames(Object.getPrototypeOf(store)) : []
          },
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('❌ Error checking Redis keys:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}
