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
import { StudySessionDto, TestResultDto } from './dto/learning.dto';

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
  async getNewWords(@Request() req, @Query('limit') limit: number = 10, @Query('level') level?: string) {
    return this.learningService.getNewWordsForLearning(req.user.userId, limit, level);
  }

  @Get('learn/review')
  async getReviewWords(@Request() req, @Query('limit') limit: number = 20, @Query('level') level?: string) {
    return this.learningService.getWordsForReview(req.user.userId, limit, level);
  }

  @Get('learn/difficult')
  async getDifficultWords(@Request() req, @Query('limit') limit: number = 20, @Query('level') level?: string) {
    return this.learningService.getDifficultWords(req.user.userId, limit, level);
  }

  @Get('today/learned')
  async getTodayLearnedWords(@Request() req) {
    return this.learningService.getTodayLearnedWords(req.user.userId);
  }

  @Get('today/reviewed')
  async getTodayReviewedWords(@Request() req) {
    return this.learningService.getTodayReviewedWords(req.user.userId);
  }

  // New Review by Period endpoints
  @Get('review/stats')
  async getReviewStats(@Request() req) {
    return this.learningService.getReviewStats(req.user.userId);
  }

  @Get('review/by-period')
  async getReviewWordsByPeriod(
    @Request() req,
    @Query('period') period: string = 'today',
    @Query('limit') limit: number = 20,
    @Query('level') level?: string
  ) {
    return this.learningService.getWordsForReviewByPeriod(req.user.userId, period, limit, level);
  }

  @Post('review/result')
  async recordReviewResult(@Request() req, @Body() body: { wordId: number; isCorrect: boolean; difficulty?: number }) {
    const { wordId, isCorrect, difficulty } = body;
    return this.learningService.recordReviewResult(req.user.userId, wordId, isCorrect, difficulty);
  }

  @Get('topics/:topic/review/by-period')
  async getReviewWordsByTopicAndPeriod(
    @Request() req,
    @Param('topic') topic: string,
    @Query('period') period: string = 'today',
    @Query('limit') limit: number = 20,
    @Query('level') level?: string
  ) {
    return this.learningService.getReviewWordsByTopicAndPeriod(req.user.userId, topic, period, limit, level);
  }

  @Get('progress')
  async getUserProgress(@Request() req, @Query('level') level?: string) {
    return this.learningService.getUserProgress(req.user.userId, level);
  }

  @Get('topics')
  async getTopics(@Query('page') page: number = 1, @Query('limit') limit: number = 20, @Query('level') level?: string) {
    return this.vocabularyService.getTopics(page, limit, level);
  }

  @Get('topics/:topic/new')
  async getNewWordsByTopic(@Request() req, @Param('topic') topic: string, @Query('limit') limit: number = 10, @Query('level') level?: string) {
    return this.learningService.getNewWordsForLearningByTopic(req.user.userId, topic, limit, level);
  }

  @Get('topics/:topic/review')
  async getReviewWordsByTopic(@Request() req, @Param('topic') topic: string, @Query('limit') limit: number = 20, @Query('level') level?: string) {
    return this.learningService.getWordsForReviewByTopic(req.user.userId, topic, limit, level);
  }

  @Get('topics/:topic/progress')
  async getProgressByTopic(@Request() req, @Param('topic') topic: string, @Query('level') level?: string) {
    return this.learningService.getUserProgressByTopic(req.user.userId, topic, level);
  }

  @Get('topics/:topic/search')
  async searchWordsByTopic(@Param('topic') topic: string, @Query('word') word: string, @Query('limit') limit: number = 10, @Query('level') level?: string) {
    return this.vocabularyService.searchWordsByTopic(topic, word, limit, level);
  }

  @Get('search/topic')
  async searchByTopicAndWord(@Query('topic') topic: string, @Query('word') word: string, @Query('level') level?: string) {
    return this.vocabularyService.findByTopicAndWord(topic, word, level);
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
  async getTopicStats(@Query('page') page: number = 1, @Query('limit') limit: number = 20) {
    return this.vocabularyService.getTopicStats(page, limit);
  }

  @Get('topic/:topic')
  async getVocabularyByTopic(
    @Param('topic') topic: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    return this.vocabularyService.findByTopic(topic, page, limit);
  }

  @Get('topics/:topic/test')
  async generateTestByTopic(
    @Request() req,
    @Param('topic') topic: string,
    @Query('count') count: number = 10,
    @Query('mode') mode: 'en-to-vi' | 'vi-to-en' | 'mixed' = 'mixed',
    @Query('inputType') inputType: 'multiple-choice' | 'text-input' | 'mixed' = 'multiple-choice',
    @Query('level') level?: string
  ) {
    return this.learningService.generateTestByTopic(req.user.userId, topic, count, mode, inputType, level);
  }
}
