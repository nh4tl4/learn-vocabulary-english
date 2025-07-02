import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VocabularyController } from './vocabulary.controller';
import { VocabularyService } from './vocabulary.service';
import { LearningService } from './learning.service';
import { VocabularyCacheService } from './vocabulary-cache.service';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { Vocabulary } from '../database/entities/vocabulary.entity';
import { UserVocabulary } from '../database/entities/user-vocabulary.entity';
import { User } from '../database/entities/user.entity';
import { Topic } from '../database/entities/topic.entity';
import { UserSelectedTopic } from '../database/entities/user-selected-topic.entity';
import { UserTopicHistory } from '../database/entities/user-topic-history.entity';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vocabulary,
      UserVocabulary,
      User,
      Topic,
      UserSelectedTopic,
      UserTopicHistory
    ]),
    RedisModule,
  ],
  controllers: [VocabularyController, TopicController],
  providers: [VocabularyService, LearningService, VocabularyCacheService, TopicService],
  exports: [VocabularyService, LearningService, VocabularyCacheService, TopicService],
})
export class VocabularyModule {}
