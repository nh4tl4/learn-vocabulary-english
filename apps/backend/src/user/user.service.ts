import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async updateProfile(id: number, updateData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, updateData);
    return this.findById(id);
  }

  async getUserStats(id: number) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userVocabularies', 'uv')
      .where('user.id = :id', { id })
      .getOne();

    if (!user) return null;

    const totalLearned = user.userVocabularies?.filter(uv => uv.isLearned).length || 0;
    const totalReviewed = user.userVocabularies?.length || 0;
    const correctAnswers = user.userVocabularies?.reduce((sum, uv) => sum + uv.correctCount, 0) || 0;
    const incorrectAnswers = user.userVocabularies?.reduce((sum, uv) => sum + uv.incorrectCount, 0) || 0;

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      stats: {
        totalLearned,
        totalReviewed,
        correctAnswers,
        incorrectAnswers,
        accuracy: correctAnswers + incorrectAnswers > 0
          ? Math.round((correctAnswers / (correctAnswers + incorrectAnswers)) * 100)
          : 0,
      },
    };
  }
}
