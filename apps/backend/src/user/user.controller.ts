import { Controller, Get, Post, Put, Body, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile(@Request() req) {
    return this.userService.findOne(req.user.userId);
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() updateData: { name?: string }) {
    return this.userService.updateProfile(req.user.userId, updateData);
  }

  @Put('daily-goal')
  async setDailyGoal(@Request() req, @Body() body: { dailyGoal: number }) {
    return this.userService.setDailyGoal(req.user.userId, body.dailyGoal);
  }

  // API endpoints cho topic history
  @Post('topic-selection')
  async saveTopicSelection(@Request() req, @Body() body: { topic: string | null }) {
    await this.userService.saveTopicSelection(req.user.userId, body.topic);
    return { success: true, message: 'Topic selection saved' };
  }

  @Get('topic-history')
  async getTopicHistory(@Request() req) {
    return this.userService.getUserTopicHistory(req.user.userId);
  }

  @Get('last-selected-topic')
  async getLastSelectedTopic(@Request() req) {
    return this.userService.getLastSelectedTopic(req.user.userId);
  }

  @Post('topic-words-learned')
  async updateTopicWordsLearned(
    @Request() req,
    @Body() body: { topic: string | null; wordsCount: number }
  ) {
    await this.userService.updateTopicWordsLearned(req.user.userId, body.topic, body.wordsCount);
    return { success: true, message: 'Topic words count updated' };
  }

  // API endpoints cho selected topics
  @Get('selected-topics')
  async getSelectedTopics(@Request() req) {
    return this.userService.getSelectedTopics(req.user.userId);
  }

  @Post('selected-topics')
  async saveSelectedTopics(@Request() req, @Body() body: { topics: string[] }) {
    await this.userService.saveSelectedTopics(req.user.userId, body.topics);
    return { success: true, message: 'Selected topics saved successfully' };
  }
}
