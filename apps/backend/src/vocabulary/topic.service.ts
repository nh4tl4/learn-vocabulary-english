import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from '../database/entities/topic.entity';
import { LearningService } from './learning.service';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
    private learningService: LearningService,
  ) {}

  async getAllTopics(): Promise<Topic[]> {
    return this.topicRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }

  async getTopicById(id: number): Promise<Topic> {
    return this.topicRepository.findOne({ where: { id } });
  }

  async getTopicByName(name: string): Promise<Topic> {
    return this.topicRepository.findOne({ where: { name } });
  }

  async createTopic(topicData: Partial<Topic>): Promise<Topic> {
    const topic = this.topicRepository.create(topicData);
    return this.topicRepository.save(topic);
  }

  async updateTopic(id: number, topicData: Partial<Topic>): Promise<Topic> {
    await this.topicRepository.update(id, topicData);
    return this.getTopicById(id);
  }

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

  async getTopicsWithCountsAndProgress(userId: number, selectedTopics: string[], level?: string): Promise<any[]> {
    const shouldFilterByLevel = level && level !== 'all';

    let topicsQuery = this.topicRepository
      .createQueryBuilder('topic')
      .leftJoin('topic.vocabularies', 'vocab')
      .select([
        'topic.id as id',
        'topic.name as name',
        'topic.nameVi as nameVi',
        'topic.description as description',
        'topic.descriptionVi as descriptionVi',
        'topic.icon as icon',
        'topic.displayOrder as displayOrder',
        'topic.isActive as isActive'
      ])
      .addSelect(
        shouldFilterByLevel
          ? `COUNT(CASE WHEN vocab.id IS NOT NULL AND vocab.level = :level THEN 1 END)`
          : `COUNT(CASE WHEN vocab.id IS NOT NULL THEN 1 END)`,
        'vocabularyCount'
      )
      .where('topic.isActive = :isActive', { isActive: true })
      .andWhere('topic.name IN (:...selectedTopics)', { selectedTopics })
      .groupBy('topic.id, topic.name, topic.nameVi, topic.description, topic.descriptionVi, topic.icon, topic.displayOrder, topic.isActive')
      .orderBy('topic.displayOrder', 'ASC');

    if (shouldFilterByLevel) {
      topicsQuery = topicsQuery.setParameter('level', level);
    }

    const rawTopics = await topicsQuery.getRawMany();

    const topics = rawTopics.map(raw => ({
      id: parseInt(raw.id),
      name: raw.name,
      nameVi: raw.nameVi,
      description: raw.description,
      descriptionVi: raw.descriptionVi,
      icon: raw.icon,
      displayOrder: parseInt(raw.displayOrder),
      isActive: raw.isActive,
      vocabularyCount: parseInt(raw.vocabularyCount) || 0
    }));

    const topicNames = topics.map(topic => topic.name);
    const progressData = await this.learningService.getUserProgressByMultipleTopics(
      userId,
      topicNames,
      shouldFilterByLevel ? level : undefined
    );

    const result = topics.map(topic => ({
      ...topic,
      progress: progressData[topic.name] || {
        topic: topic.name,
        totalLearned: 0,
        mastered: 0,
        learning: 0,
        difficult: 0,
        masteryPercentage: 0,
        level: shouldFilterByLevel ? level : undefined
      }
    }));

    return result;
  }
}
