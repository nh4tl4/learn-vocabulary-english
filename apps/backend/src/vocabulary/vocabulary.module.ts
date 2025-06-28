import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VocabularyController } from './vocabulary.controller';
import { VocabularyService } from './vocabulary.service';
import { LearningService } from './learning.service';
import { Vocabulary } from '../database/entities/vocabulary.entity';
import { UserVocabulary } from '../database/entities/user-vocabulary.entity';
import { User } from '../database/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vocabulary, UserVocabulary, User])],
  controllers: [VocabularyController],
  providers: [VocabularyService, LearningService],
  exports: [VocabularyService, LearningService],
})
export class VocabularyModule {}
