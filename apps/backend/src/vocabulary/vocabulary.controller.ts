import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { LearningService } from './learning.service';
import { TopicService } from './topic.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StudySessionDto, TestResultDto } from './dto/learning.dto';

@Controller('vocabulary')
@UseGuards(JwtAuthGuard)
export class VocabularyController {
  constructor(
    private readonly vocabularyService: VocabularyService,
    private readonly learningService: LearningService,
    private readonly topicService: TopicService,
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

  @Get('topics/:topicId/review/by-period')
  async getReviewWordsByTopicAndPeriod(
    @Request() req,
    @Param('topicId', ParseIntPipe) topicId: number,
    @Query('period') period: string = 'today',
    @Query('limit') limit: number = 20,
    @Query('level') level?: string
  ) {
    return this.learningService.getReviewWordsByTopicAndPeriod(req.user.userId, topicId.toString(), period, limit, level);
  }

  @Get('progress')
  async getUserProgress(@Request() req, @Query('level') level?: string) {
    return this.learningService.getUserProgress(req.user.userId, level);
  }

  @Get('topics')
  async getTopics(@Query('page') page: number = 1, @Query('limit') limit: number = 20, @Query('level') level?: string) {
    return this.vocabularyService.getTopics(page, limit, level);
  }

  @Get('topics/:topicId/new')
  async getNewWordsByTopic(@Request() req, @Param('topicId', ParseIntPipe) topicId: number, @Query('limit') limit: number = 10, @Query('level') level?: string) {
    // Get topic name from topicId first
    const topic = await this.topicService.getTopicById(topicId);
    if (!topic) {
      throw new Error(`Topic with ID ${topicId} not found`);
    }
    return this.learningService.getNewWordsForLearningByTopic(req.user.userId, topic.name, limit, level);
  }

  @Get('topics/:topicId/review')
  async getReviewWordsByTopic(@Request() req, @Param('topicId', ParseIntPipe) topicId: number, @Query('limit') limit: number = 20, @Query('level') level?: string) {
    // Get topic name from topicId first
    const topic = await this.topicService.getTopicById(topicId);
    if (!topic) {
      throw new Error(`Topic with ID ${topicId} not found`);
    }
    return this.learningService.getWordsForReviewByTopic(req.user.userId, topic.name, limit, level);
  }

  @Get('topics/:topicId/progress')
  async getProgressByTopic(@Request() req, @Param('topicId', ParseIntPipe) topicId: number, @Query('level') level?: string) {
    // Get topic name from topicId first
    const topic = await this.topicService.getTopicById(topicId);
    if (!topic) {
      throw new Error(`Topic with ID ${topicId} not found`);
    }
    return this.learningService.getUserProgressByTopic(req.user.userId, topic.name, level);
  }

  @Get('topics/:topicId/search')
  async searchWordsByTopic(@Param('topicId', ParseIntPipe) topicId: number, @Query('word') word: string, @Query('limit') limit: number = 10, @Query('level') level?: string) {
    return this.vocabularyService.searchWordsByTopicId(topicId, word, limit, level);
  }

  @Get('search/topic')
  async searchByTopicAndWord(@Query('topic') topic: string, @Query('word') word: string, @Query('level') level?: string) {
    return this.vocabularyService.findByTopicAndWord(topic, word, level);
  }

  @Get('topics/:topicId/test')
  async generateTestByTopic(
    @Request() req,
    @Param('topicId', ParseIntPipe) topicId: number,
    @Query('count') count: number = 10,
    @Query('mode') mode: 'en-to-vi' | 'vi-to-en' | 'mixed' = 'mixed',
    @Query('inputType') inputType: 'multiple-choice' | 'text-input' | 'mixed' = 'multiple-choice',
    @Query('level') level?: string
  ) {
    // Use the new generateTestByTopicId method that properly handles topicId
    return this.learningService.generateTestByTopicId(req.user.userId, topicId, count, mode, inputType, level);
  }

  @Get('topics/stats')
  async getTopicStats(@Query('page') page: number = 1, @Query('limit') limit: number = 20, @Query('level') level?: string) {
    return this.vocabularyService.getTopicStats(page, limit, level);
  }

  @Get('progress/multiple')
  async getProgressByMultipleTopics(
    @Request() req,
    @Query('topics') topics: string,
    @Query('level') level?: string
  ) {
    // Add validation for topics parameter
    if (!topics || topics.trim() === '') {
      throw new Error('Topics parameter is required');
    }
    const topicNames = topics.split(',').filter(t => t.trim());
    if (topicNames.length === 0) {
      throw new Error('At least one topic must be specified');
    }
    return this.learningService.getUserProgressByMultipleTopics(req.user.userId, topicNames, level);
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
}
