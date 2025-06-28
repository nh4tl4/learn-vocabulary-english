import { IsNumber, IsBoolean, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { LearningStatus } from '../../database/entities/user-vocabulary.entity';

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
  quality: number; // 1-5 rating

  @IsNumber()
  responseTime: number; // in seconds
}

export class TestResultDto {
  @IsNumber()
  vocabularyId: number;

  @IsNumber()
  selectedOptionId: number;

  @IsNumber()
  correctOptionId: number;

  @IsNumber()
  timeSpent: number; // in seconds
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

  @IsOptional()
  @IsBoolean()
  onlyDue?: boolean;
}

export class UpdateProgressDto {
  @IsNumber()
  vocabularyId: number;

  @IsBoolean()
  isCorrect: boolean;

  @IsOptional()
  @IsNumber()
  responseTime?: number;
}
