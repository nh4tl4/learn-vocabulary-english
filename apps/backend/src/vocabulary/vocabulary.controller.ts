import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

class CreateVocabularyDto {
  @IsString()
  word: string;

  @IsString()
  meaning: string;

  @IsOptional()
  @IsString()
  pronunciation?: string;

  @IsOptional()
  @IsString()
  example?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  partOfSpeech?: string;
}

class UpdateProgressDto {
  @IsNumber()
  vocabularyId: number;

  @IsBoolean()
  isCorrect: boolean;
}

@Controller('vocabulary')
@UseGuards(JwtAuthGuard)
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  @Get()
  async getAllVocabularies(@Query('page') page: number = 1, @Query('limit') limit: number = 20) {
    return this.vocabularyService.getAllVocabularies(page, limit);
  }

  @Get('random')
  async getRandomVocabularies(@Request() req, @Query('count') count: number = 10) {
    return this.vocabularyService.getRandomVocabularies(req.user.userId, count);
  }

  @Get('progress')
  async getUserProgress(@Request() req) {
    return this.vocabularyService.getUserVocabularyProgress(req.user.userId);
  }

  @Post()
  async createVocabulary(@Body() createVocabularyDto: CreateVocabularyDto) {
    return this.vocabularyService.createVocabulary(createVocabularyDto);
  }

  @Post('progress')
  async updateProgress(@Request() req, @Body() updateProgressDto: UpdateProgressDto) {
    return this.vocabularyService.updateUserVocabularyProgress(
      req.user.userId,
      updateProgressDto.vocabularyId,
      updateProgressDto.isCorrect,
    );
  }

  @Get(':id')
  async getVocabularyById(@Param('id') id: number) {
    return this.vocabularyService.getVocabularyById(id);
  }
}
