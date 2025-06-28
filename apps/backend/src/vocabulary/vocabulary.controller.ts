import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { LearningService } from './learning.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StudySessionDto, ReviewFilterDto, SetDailyGoalDto, TestResultDto } from './dto/learning.dto';

@Controller('vocabulary')
@UseGuards(JwtAuthGuard)
export class VocabularyController {
  constructor(
    private readonly vocabularyService: VocabularyService,
    private readonly learningService: LearningService,
  ) {}

  // Existing endpoints
  @Get()
  async getVocabulary(@Query('page') page: number = 1, @Query('limit') limit: number = 20) {
    return this.vocabularyService.findAll(page, limit);
  }

  @Get('random')
  async getRandom(@Query('count') count: number = 10) {
    return this.vocabularyService.findRandom(count);
  }

  @Get(':id')
  async getById(@Param('id') id: number) {
    return this.vocabularyService.findOne(id);
  }

  // New Learning System Endpoints

  @Get('dashboard/stats')
  async getLearningDashboard(@Request() req) {
    return this.learningService.getLearningDashboard(req.user.userId);
  }

  @Get('learn/new')
  async getNewWords(@Request() req, @Query('limit') limit: number = 10) {
    return this.learningService.getNewWordsForLearning(req.user.userId, limit);
  }

  @Get('review/due')
  async getWordsForReview(@Request() req, @Query('limit') limit: number = 20) {
    return this.learningService.getWordsForReview(req.user.userId, limit);
  }

  @Post('learn/session')
  async processStudySession(@Request() req, @Body() sessionData: StudySessionDto) {
    return this.learningService.processStudySession(req.user.userId, sessionData);
  }

  @Get('test/generate')
  async generateTest(@Request() req, @Query('count') count: number = 10) {
    return this.learningService.generateTest(req.user.userId, count);
  }

  @Post('test/submit')
  async submitTestResults(@Request() req, @Body() results: TestResultDto[]) {
    const processedResults = [];

    for (const result of results) {
      const quality = result.selectedOptionId === result.correctOptionId ? 4 : 1;
      const sessionData: StudySessionDto = {
        vocabularyId: result.vocabularyId,
        quality,
        responseTime: result.timeSpent,
      };

      const processed = await this.learningService.processStudySession(req.user.userId, sessionData);
      processedResults.push({
        vocabularyId: result.vocabularyId,
        correct: result.selectedOptionId === result.correctOptionId,
        newStatus: processed.status,
        nextReview: processed.nextReviewDate,
      });
    }

    return {
      results: processedResults,
      totalCorrect: processedResults.filter(r => r.correct).length,
      totalQuestions: results.length,
      score: Math.round((processedResults.filter(r => r.correct).length / results.length) * 100),
    };
  }

  @Get('progress/today')
  async getTodayProgress(@Request() req) {
    return this.learningService.getTodayProgress(req.user.userId);
  }

  // Existing endpoints...
  @Get('progress')
  async getProgress(@Request() req) {
    return this.vocabularyService.getUserProgress(req.user.userId);
  }

  @Post('progress')
  async updateProgress(@Request() req, @Body() body: { vocabularyId: number; isCorrect: boolean }) {
    return this.vocabularyService.updateProgress(req.user.userId, body.vocabularyId, body.isCorrect);
  }

  @Post()
  async create(@Body() createVocabularyDto: any) {
    return this.vocabularyService.create(createVocabularyDto);
  }
}
