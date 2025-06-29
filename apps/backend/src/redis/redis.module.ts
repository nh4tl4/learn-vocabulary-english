import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

        // Parse Redis URL for connection options
        const url = new URL(redisUrl);

        return {
          store: redisStore as any,
          host: url.hostname,
          port: parseInt(url.port) || 6379,
          password: url.password || undefined,
          db: 0,
          ttl: 300, // Default TTL 5 minutes
          max: 1000, // Maximum number of items in cache
        };
      },
    }),
  ],
  providers: [RedisService],
  exports: [CacheModule, RedisService],
})
export class RedisModule {}
