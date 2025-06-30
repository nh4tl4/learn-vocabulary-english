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
            store: redisStore as any,
            host: url.hostname,
            port: parseInt(url.port) || 6379,
            password: url.password || undefined,
            db: parseInt(url.pathname.slice(1)) || 0,
            ttl: 300,
            max: 1000,
            // Add connection retry and timeout options
            retryAttempts: 3,
            retryDelay: 1000,
            connectTimeout: 10000,
            lazyConnect: true,
            // Add error handling options
            enableOfflineQueue: false,
            maxRetriesPerRequest: 3,
          };

          console.log('🔴 Redis Config:', {
            host: config.host,
            port: config.port,
            db: config.db,
            hasPassword: !!config.password
          });

          console.log('🔄 Attempting to connect to Redis...');

          // Test basic connection using native redis client
          const { createClient } = require('redis');
          const testClient = createClient({
            url: redisUrl,
            socket: {
              connectTimeout: 5000,
              reconnectStrategy: false
            }
          });

          // Test connection with timeout
          const connectionPromise = testClient.connect();
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Connection timeout')), 5000)
          );

          await Promise.race([connectionPromise, timeoutPromise]);
          await testClient.ping();
          console.log('✅ Redis connection successful');
          await testClient.disconnect();

          return config;

        } catch (error) {
          console.error('❌ Redis connection failed:', error.message);
          console.log('📢 Falling back to in-memory store');

          // Return memory store configuration (no Redis)
          return {
            ttl: 300,
            max: 1000,
            // This will use in-memory caching instead of Redis
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
