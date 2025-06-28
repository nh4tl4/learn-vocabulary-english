import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from '@/database/entities/user.entity';
import { UserVocabulary } from '@/database/entities/user-vocabulary.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserVocabulary])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
