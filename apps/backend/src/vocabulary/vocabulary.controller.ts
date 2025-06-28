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

  // New Learning System Endpoints - place BEFORE :id route

  @Get('dashboard/stats')
  async getLearningDashboard(@Request() req) {
    return this.learningService.getLearningDashboard(req.user.userId);
  }

  @Get('learn/new')
  async getNewWords(@Request() req, @Query('limit') limit: number = 10) {
    return this.learningService.getNewWordsForLearning(req.user.userId, limit);
  }

  @Get('learn/review')
  async getReviewWords(@Request() req, @Query('limit') limit: number = 20) {
    return this.learningService.getWordsForReview(req.user.userId, limit);
  }

  @Get('learn/difficult')
  async getDifficultWords(@Request() req, @Query('limit') limit: number = 20) {
    return this.learningService.getDifficultWords(req.user.userId, limit);
  }

  @Get('progress')
  async getUserProgress(@Request() req) {
    return this.learningService.getUserProgress(req.user.userId);
  }

  @Get('topics')
  async getTopics() {
    return this.vocabularyService.getTopics();
  }

  @Get('topics/:topic/new')
  async getNewWordsByTopic(@Request() req, @Param('topic') topic: string, @Query('limit') limit: number = 10) {
    return this.learningService.getNewWordsForLearningByTopic(req.user.userId, topic, limit);
  }

  @Get('topics/:topic/review')
  async getReviewWordsByTopic(@Request() req, @Param('topic') topic: string, @Query('limit') limit: number = 20) {
    return this.learningService.getWordsForReviewByTopic(req.user.userId, topic, limit);
  }

  @Get('topics/:topic/progress')
  async getProgressByTopic(@Request() req, @Param('topic') topic: string) {
    return this.learningService.getUserProgressByTopic(req.user.userId, topic);
  }

  // Move :id route to the END to avoid conflicts
  @Get(':id')
  async getById(@Param('id') id: string) {
    // Validate that id is actually a number
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new Error(`Invalid ID format: ${id}`);
    }
    return this.vocabularyService.findOne(numericId);
  }

  @Post('learn/session')
  async processStudySession(@Request() req, @Body() sessionData: StudySessionDto) {
    return this.learningService.processStudySession(req.user.userId, sessionData);
  }

  @Get('test/generate')
  async generateTest(
    @Request() req,
    @Query('count') count: number = 10,
    @Query('mode') mode: 'en-to-vi' | 'vi-to-en' | 'mixed' = 'mixed',
    @Query('inputType') inputType: 'multiple-choice' | 'text-input' | 'mixed' = 'multiple-choice'
  ) {
    return this.learningService.generateTest(req.user.userId, count, mode, inputType);
  }

  @Post('test/submit')
  async submitTest(@Request() req, @Body() testResults: TestResultDto[]) {
    return this.learningService.submitTestResults(req.user.userId, testResults);
  }

  @Post()
  async create(@Body() createVocabularyDto: any) {
    return this.vocabularyService.create(createVocabularyDto);
  }

  // Topic-based endpoints
  @Get('topics/stats')
  async getTopicStats() {
    return this.vocabularyService.getTopicStats();
  }

  @Get('topic/:topic')
  async getVocabularyByTopic(@Param('topic') topic: string, @Query('page') page: number = 1, @Query('limit') limit: number = 20) {
    return this.vocabularyService.findByTopic(topic, page, limit);
  }
}
