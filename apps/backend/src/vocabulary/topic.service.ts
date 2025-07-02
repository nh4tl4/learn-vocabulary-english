import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from '../database/entities/topic.entity';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
  ) {}

  // Get all active topics
  async getAllTopics(): Promise<Topic[]> {
    return this.topicRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }

  // Get topic by ID
  async getTopicById(id: number): Promise<Topic> {
    return this.topicRepository.findOne({ where: { id } });
  }

  // Get topic by name
  async getTopicByName(name: string): Promise<Topic> {
    return this.topicRepository.findOne({ where: { name } });
  }

  // Create new topic
  async createTopic(topicData: Partial<Topic>): Promise<Topic> {
    const topic = this.topicRepository.create(topicData);
    return this.topicRepository.save(topic);
  }

  // Update topic
  async updateTopic(id: number, topicData: Partial<Topic>): Promise<Topic> {
    await this.topicRepository.update(id, topicData);
    return this.getTopicById(id);
  }

  // Update vocabulary count for a topic
  async updateVocabularyCount(topicId: number): Promise<void> {
    await this.topicRepository.query(`
      UPDATE topics 
      SET vocabularyCount = (
        SELECT COUNT(*) 
        FROM vocabulary 
        WHERE topicId = ?
      ) 
      WHERE id = ?
    `, [topicId, topicId]);
  }

  // Get topics with vocabulary counts - Updated to include all topic fields
  async getTopicsWithCounts(): Promise<Topic[]> {
    return this.topicRepository
      .createQueryBuilder('topic')
      .select([
        'topic.id',
        'topic.name',
        'topic.nameVi',
        'topic.description',
        'topic.descriptionVi',
        'topic.icon',
        'topic.displayOrder',
        'topic.isActive'
      ])
      .loadRelationCountAndMap('topic.vocabularyCount', 'topic.vocabularies')
      .where('topic.isActive = :isActive', { isActive: true })
      .orderBy('topic.displayOrder', 'ASC')
      .getMany();
  }
}
