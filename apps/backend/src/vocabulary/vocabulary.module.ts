import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VocabularyService } from './vocabulary.service';
import { VocabularyController } from './vocabulary.controller';
import { Vocabulary } from '../database/entities/vocabulary.entity';
import { UserVocabulary } from '../database/entities/user-vocabulary.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vocabulary, UserVocabulary])],
  controllers: [VocabularyController],
  providers: [VocabularyService],
  exports: [VocabularyService],
})
export class VocabularyModule {}
