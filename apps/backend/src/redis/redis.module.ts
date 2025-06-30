import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { RedisService } from './redis.service';
import { RedisController } from './redis.controller';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => {
        const redisUrl = process.env.REDIS_URL || 'redis://:emddi2024@svc.emddi.net:6379/12';
        console.log('🔴 Redis URL:', redisUrl);

        try {
          // Parse Redis URL for connection options
          const url = new URL(redisUrl);

          const config = {
            store: redisStore,
            host: url.hostname,
            port: parseInt(url.port) || 6379,
            password: url.password || undefined,
            db: parseInt(url.pathname.slice(1)) || 0,
            ttl: 300,
            // Remove incompatible options for redis store
            isGlobal: true,
          };

          console.log('🔴 Redis Config:', {
            host: config.host,
            port: config.port,
            db: config.db,
            hasPassword: !!config.password
          });

          console.log('🔄 Attempting to connect to Redis...');

          // Test Redis connection before using it
          const Redis = require('redis');
          const testClient = Redis.createClient({
            url: redisUrl
          });

          await testClient.connect();
          await testClient.ping();
          console.log('✅ Redis connection successful');
          await testClient.disconnect();

          return config;

        } catch (error) {
          console.error('❌ Redis connection failed:', error.message);
          console.log('📢 Falling back to in-memory store');

          // Return memory store configuration
          return {
            ttl: 300,
            max: 1000,
            isGlobal: true,
          };
        }
      },
    }),
  ],
  controllers: [RedisController],
  providers: [RedisService],
  exports: [CacheModule, RedisService],
})
export class RedisModule {}
