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

  @Get('difficult')
  async getDifficultWords(@Request() req, @Query('limit') limit: number = 20) {
    return this.learningService.getDifficultWords(req.user.userId, limit);
  }

  @Get('progress')
  async getProgress(@Request() req) {
    return this.learningService.getUserProgress(req.user.userId);
  }

  @Post('progress')
  async updateProgress(@Request() req, @Body() body: { vocabularyId: number; isCorrect: boolean }) {
    return this.vocabularyService.updateProgress(req.user.userId, body.vocabularyId, body.isCorrect);
  }

  @Post()
  async create(@Body() createVocabularyDto: any) {
    return this.vocabularyService.create(createVocabularyDto);
  }

  // Topic-based endpoints
  @Get('topics')
  async getTopics() {
    return this.vocabularyService.getTopics();
  }

  @Get('topics/stats')
  async getTopicStats() {
    return this.vocabularyService.getTopicStats();
  }

  @Get('topic/:topic')
  async getVocabularyByTopic(@Param('topic') topic: string, @Query('page') page: number = 1, @Query('limit') limit: number = 20) {
    return this.vocabularyService.findByTopic(topic, page, limit);
  }

  @Get('learn/new/topic/:topic')
  async getNewWordsByTopic(@Request() req, @Param('topic') topic: string, @Query('limit') limit: number = 10) {
    return this.learningService.getNewWordsForLearningByTopic(req.user.userId, topic, limit);
  }

  @Get('review/topic/:topic')
  async getReviewWordsByTopic(@Request() req, @Param('topic') topic: string, @Query('limit') limit: number = 20) {
    return this.learningService.getWordsForReviewByTopic(req.user.userId, topic, limit);
  }

  @Get('test/topic/:topic')
  async generateTestByTopic(
    @Request() req,
    @Param('topic') topic: string,
    @Query('count') count: number = 10,
    @Query('mode') mode: 'en-to-vi' | 'vi-to-en' | 'mixed' = 'mixed',
    @Query('inputType') inputType: 'multiple-choice' | 'text-input' | 'mixed' = 'multiple-choice'
  ) {
    return this.learningService.generateTestByTopic(req.user.userId, topic, count, mode, inputType);
  }

  @Get('progress/topic/:topic')
  async getProgressByTopic(@Request() req, @Param('topic') topic: string) {
    return this.learningService.getUserProgressByTopic(req.user.userId, topic);
  }
}
