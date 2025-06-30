import { Module, Global, DynamicModule, Provider } from '@nestjs/common';
import { createClient, createCluster, RedisClientOptions } from 'redis';
import { REDIS_MODULE_CONNECTION_TOKEN } from './redis.constants';
import { RedisService } from './redis.service';

export type RedisModuleOptions = RedisClientOptions;

/** A conventional Redis connection. */
export type RedisClientConnection = ReturnType<typeof createClient>;

/** A clustered Redis connection. */
export type RedisClusterConnection = ReturnType<typeof createCluster>;

/** A Redis connection, clustered or conventional. */
export type RedisConnection = RedisClientConnection | RedisClusterConnection;

export interface RedisModuleAsyncOptions {
  useFactory?: (...args: any[]) => Promise<RedisModuleOptions> | RedisModuleOptions;
  imports?: any[];
  inject?: any[];
}

@Global()
@Module({})
export class RedisModule {
  static forRoot(options: RedisModuleOptions): DynamicModule {
    return {
      module: RedisModule,
      providers: [
        {
          provide: REDIS_MODULE_CONNECTION_TOKEN,
          useFactory: async (): Promise<RedisConnection> => {
            const client = createClient(options);
            client.on('error', (err) => console.error('Redis Client Error', err));
            await client.connect();
            return client;
          },
        },
        RedisService,
      ],
      exports: [REDIS_MODULE_CONNECTION_TOKEN, RedisService],
    };
  }

  static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
    const redisProvider: Provider = {
      provide: REDIS_MODULE_CONNECTION_TOKEN,
      useFactory: async (...args: any[]): Promise<RedisConnection> => {
        const config = await options.useFactory(...args);
        const client = createClient(config);
        client.on('error', (err) => console.error('Redis Client Error', err));
        await client.connect();
        return client;
      },

      inject: options.inject || [],
    };

    return {
      module: RedisModule,
      imports: options.imports || [],
      providers: [redisProvider, RedisService],
      exports: [REDIS_MODULE_CONNECTION_TOKEN, RedisService],
    };
  }
}
