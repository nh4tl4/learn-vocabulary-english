import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserVocabulary } from './user-vocabulary.entity';
import { UserTopicHistory } from './user-topic-history.entity';
import { UserSelectedTopic } from './user-selected-topic.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ default: 10 })
  dailyGoal: number; // Words per day

  @Column({ default: 0 })
  currentStreak: number; // Days in a row

  @Column({ default: 0 })
  longestStreak: number;

  @Column({ type: 'date', nullable: true })
  lastStudyDate: Date;

  @Column({ default: 0 })
  totalWordsLearned: number;

  @Column({ default: 0 })
  totalTestsTaken: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  averageTestScore: number;

  @Column({ default: 'beginner' })
  level: string; // beginner, intermediate, advanced

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserVocabulary, userVocabulary => userVocabulary.user)
  userVocabularies: UserVocabulary[];

  @OneToMany(() => UserTopicHistory, topicHistory => topicHistory.user)
  topicHistory: UserTopicHistory[];

  @OneToMany(() => UserSelectedTopic, userSelectedTopic => userSelectedTopic.user)
  userSelectedTopics: UserSelectedTopic[];

  // Calculate today's progress
  get todayProgress(): number {
    // This will be calculated in the service layer
    return 0;
  }

  // Check if daily goal is completed
  get isDailyGoalCompleted(): boolean {
    return this.todayProgress >= this.dailyGoal;
  }
}
