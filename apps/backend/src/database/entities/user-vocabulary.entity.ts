import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Vocabulary } from './vocabulary.entity';

export enum LearningStatus {
  NEW = 'new',
  LEARNING = 'learning',
  REVIEWING = 'reviewing',
  MASTERED = 'mastered',
  DIFFICULT = 'difficult',
  NOT_LEARNED = 'not_learned', // For words not yet learned
}

@Entity('user_vocabulary')
@Index(['userId', 'vocabularyId'], { unique: true })
export class UserVocabulary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  vocabularyId: number;

  @Column({
    type: 'enum',
    enum: LearningStatus,
    default: LearningStatus.NEW,
  })
  status: LearningStatus;

  @Column({ default: 0 })
  correctCount: number;

  @Column({ default: 0 })
  incorrectCount: number;

  @Column({ default: 0 })
  reviewCount: number;

  @Column({ default: 1.0 })
  easeFactor: number; // For spaced repetition

  @Column({ default: 1 })
  interval: number; // Days until next review

  @Column({ type: 'timestamp', nullable: true })
  nextReviewDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastReviewedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  firstLearnedDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.userVocabularies)
  user: User;

  @ManyToOne(() => Vocabulary, (vocabulary) => vocabulary.userVocabularies)
  vocabulary: Vocabulary;

  // Calculate accuracy percentage
  get accuracy(): number {
    const total = this.correctCount + this.incorrectCount;
    return total > 0 ? Math.round((this.correctCount / total) * 100) : 0;
  }

  // Check if word needs review
  get needsReview(): boolean {
    if (!this.nextReviewDate) return false;
    return new Date() >= this.nextReviewDate;
  }
}
