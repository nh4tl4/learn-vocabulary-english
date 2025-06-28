import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { VocabularyModule } from './vocabulary/vocabulary.module';
import { User } from './database/entities/user.entity';
import { Vocabulary } from './database/entities/vocabulary.entity';
import { UserVocabulary } from './database/entities/user-vocabulary.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'english',
      ssl: { rejectUnauthorized: false }, // Bắt buộc SSL cho Neon
      entities: [User, Vocabulary, UserVocabulary],
      synchronize: false, // Tắt synchronize vì đã có migration
    }),
    AuthModule,
    UserModule,
    VocabularyModule,
  ],
})
export class AppModule {}
