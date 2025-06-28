import { IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { LearningStatus } from '../database/entities/user-vocabulary.entity';

export class SetDailyGoalDto {
  @IsNumber()
  @Min(1)
  @Max(100)
  dailyGoal: number;
}

export class StudySessionDto {
  @IsNumber()
  vocabularyId: number;

  @IsNumber()
  @Min(0)
  @Max(5)
  quality: number; // 0-5 for spaced repetition (0 = total blackout, 5 = perfect response)

  @IsNumber()
  @Min(0)
  responseTime: number; // Time taken to answer in seconds
}

export class TestResultDto {
  @IsNumber()
  vocabularyId: number;

  @IsNumber()
  selectedOptionId: number;

  @IsNumber()
  correctOptionId: number;

  @IsNumber()
  @Min(0)
  timeSpent: number; // Time in seconds
}

export class ReviewFilterDto {
  @IsOptional()
  @IsEnum(LearningStatus)
  status?: LearningStatus;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsNumber()
  @Min(0)
  skip?: number = 0;
}
