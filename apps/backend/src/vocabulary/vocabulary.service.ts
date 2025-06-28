import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vocabulary } from '../database/entities/vocabulary.entity';
import { UserVocabulary } from '../database/entities/user-vocabulary.entity';

@Injectable()
export class VocabularyService {
  constructor(
    @InjectRepository(Vocabulary)
    private vocabularyRepository: Repository<Vocabulary>,
    @InjectRepository(UserVocabulary)
    private userVocabularyRepository: Repository<UserVocabulary>,
  ) {}

  async getAllVocabularies(page: number = 1, limit: number = 20) {
    const [vocabularies, total] = await this.vocabularyRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      vocabularies,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getVocabularyById(id: number) {
    return this.vocabularyRepository.findOne({ where: { id } });
  }

  async createVocabulary(vocabularyData: Partial<Vocabulary>) {
    const vocabulary = this.vocabularyRepository.create(vocabularyData);
    return this.vocabularyRepository.save(vocabulary);
  }

  async getUserVocabularyProgress(userId: number) {
    return this.userVocabularyRepository.find({
      where: { userId },
      relations: ['vocabulary'],
      order: { lastReviewedAt: 'DESC' },
    });
  }

  async updateUserVocabularyProgress(
    userId: number,
    vocabularyId: number,
    isCorrect: boolean,
  ) {
    let userVocabulary = await this.userVocabularyRepository.findOne({
      where: { userId, vocabularyId },
    });

    if (!userVocabulary) {
      userVocabulary = this.userVocabularyRepository.create({
        userId,
        vocabularyId,
        correctCount: 0,
        incorrectCount: 0,
      });
    }

    if (isCorrect) {
      userVocabulary.correctCount++;
      if (userVocabulary.correctCount >= 3) {
        userVocabulary.isLearned = true;
      }
    } else {
      userVocabulary.incorrectCount++;
    }

    userVocabulary.lastReviewedAt = new Date();
    return this.userVocabularyRepository.save(userVocabulary);
  }

  async getRandomVocabularies(userId: number, count: number = 10) {
    // Get vocabularies that user hasn't mastered yet
    const unmastered = await this.vocabularyRepository
      .createQueryBuilder('vocab')
      .leftJoin(
        'vocab.userVocabularies',
        'uv',
        'uv.vocabularyId = vocab.id AND uv.userId = :userId',
        { userId },
      )
      .where('uv.isLearned IS NULL OR uv.isLearned = false')
      .orderBy('RANDOM()')
      .limit(count)
      .getMany();

    return unmastered;
  }
}
