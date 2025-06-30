import { Module } from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { VocabularyModule } from './vocabulary/vocabulary.module';
import { AIModule } from './ai/ai.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const databaseUrl = process.env.DATABASE_URL;

        if (databaseUrl) {
          // Production: Use PostgreSQL from Render
          return {
            type: 'postgres',
            url: databaseUrl,
            ssl: { rejectUnauthorized: false },
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: false,
            migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
            migrationsRun: true,
          };
        } else {
          // Development: Use SQLite for local development
          return {
            type: 'sqlite',
            database: 'vocabulary.db',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: false,
            migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
            migrationsRun: true,
          };
        }
      },
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        url: configService.get('REDIS_URL'),
        pingInterval: 60000,
      }),
    }),
    AuthModule,
    UserModule,
    VocabularyModule,
    AIModule, // Add AI module
  ],
  controllers: [AppController],
})
export class AppModule {}
