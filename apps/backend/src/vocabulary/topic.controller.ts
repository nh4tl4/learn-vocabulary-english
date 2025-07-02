import { Controller, Get, Post, Put, Body, Param, ParseIntPipe } from '@nestjs/common';
import { TopicService } from './topic.service';
import { Topic } from '../database/entities/topic.entity';

@Controller('topics')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Get()
  async getAllTopics(): Promise<Topic[]> {
    return this.topicService.getAllTopics();
  }

  @Get('with-counts')
  async getTopicsWithCounts(): Promise<Topic[]> {
    return this.topicService.getTopicsWithCounts();
  }

  @Get(':id')
  async getTopicById(@Param('id', ParseIntPipe) id: number): Promise<Topic> {
    return this.topicService.getTopicById(id);
  }

  @Post()
  async createTopic(@Body() topicData: Partial<Topic>): Promise<Topic> {
    return this.topicService.createTopic(topicData);
  }

  @Put(':id')
  async updateTopic(
    @Param('id', ParseIntPipe) id: number,
    @Body() topicData: Partial<Topic>
  ): Promise<Topic> {
    return this.topicService.updateTopic(id, topicData);
  }
}
