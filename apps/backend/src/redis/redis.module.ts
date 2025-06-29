import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => {
        const redisUrl = process.env.REDIS_URL || 'redis://:emddi2024@svc.emddi.net:6379/12';
        console.log('🔴 Redis URL:', redisUrl);

        // Parse Redis URL for connection options
        const url = new URL(redisUrl);

        const config = {
          store: redisStore as any,
          host: url.hostname,
          port: parseInt(url.port) || 6379,
          password: url.password || undefined,
          db: parseInt(url.pathname.slice(1)) || 0, // Extract DB number from path
          ttl: 300, // Default TTL 5 minutes
          max: 1000, // Maximum number of items in cache
        };

        console.log('🔴 Redis Config:', {
          host: config.host,
          port: config.port,
          db: config.db,
          hasPassword: !!config.password
        });

        return config;
      },
    }),
  ],
  providers: [RedisService],
  exports: [CacheModule, RedisService],
})
export class RedisModule {}
