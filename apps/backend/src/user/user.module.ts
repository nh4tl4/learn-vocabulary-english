import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../database/entities/user.entity';
import { UserVocabulary } from '../database/entities/user-vocabulary.entity';
import { UserTopicHistory } from '../database/entities/user-topic-history.entity';
import { UserSelectedTopic } from '../database/entities/user-selected-topic.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserVocabulary, UserTopicHistory, UserSelectedTopic])
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
