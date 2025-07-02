import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Topic } from './topic.entity';

@Entity('user_topic_history')
@Index(['userId', 'topicId']) // Updated index để query nhanh
@Index(['userId', 'createdAt']) // Index theo thời gian
export class UserTopicHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ nullable: true })
  topicId: number; // Foreign key to Topic (null = "Tất cả chủ đề")

  @Column({ nullable: true })
  topic: string; // Deprecated - keep for backward compatibility

  @Column({ default: 1 })
  sessionCount: number; // Số lần chọn chủ đề này

  @Column({ default: 0 })
  wordsLearned: number; // Số từ đã học trong chủ đề này

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastSelectedAt: Date; // Lần cuối chọn chủ đề này

  @ManyToOne(() => User, user => user.topicHistory)
  @JoinColumn({ name: 'userId' })
  user: User;

  // New relation to Topic
  @ManyToOne(() => Topic, topic => topic.userTopicHistories, { nullable: true })
  @JoinColumn({ name: 'topicId' })
  topicEntity: Topic;
}
