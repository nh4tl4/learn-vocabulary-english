import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Vocabulary } from './vocabulary.entity';

@Entity()
export class UserVocabulary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  vocabularyId: number;

  @Column({ default: false })
  isLearned: boolean;

  @Column({ default: 0 })
  correctCount: number;

  @Column({ default: 0 })
  incorrectCount: number;

  @Column({ nullable: true })
  lastReviewedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.userVocabularies)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Vocabulary, vocabulary => vocabulary.userVocabularies)
  @JoinColumn({ name: 'vocabularyId' })
  vocabulary: Vocabulary;
}
