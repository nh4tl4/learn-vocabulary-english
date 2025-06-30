import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VocabularyController } from './vocabulary.controller';
import { VocabularyService } from './vocabulary.service';
import { LearningService } from './learning.service';
import { VocabularyCacheService } from './vocabulary-cache.service';
import { Vocabulary } from '../database/entities/vocabulary.entity';
import { UserVocabulary } from '../database/entities/user-vocabulary.entity';
import { User } from '../database/entities/user.entity';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vocabulary, UserVocabulary, User]),
    RedisModule,
  ],
  controllers: [VocabularyController],
  providers: [VocabularyService, LearningService, VocabularyCacheService],
  exports: [VocabularyService, LearningService, VocabularyCacheService],
})
export class VocabularyModule {}
