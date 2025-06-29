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
          };

          console.log('🔴 Redis Config:', {
            host: config.host,
            port: config.port,
            db: config.db,
            hasPassword: !!config.password
          });

          // Test connection
          console.log('🔄 Attempting to connect to Redis...');
          return config;

        } catch (error) {
          console.error('❌ Redis configuration error:', error);
          console.log('📢 Falling back to memory store');
          return {
            ttl: 300,
            max: 1000,
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
