import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Topic } from './topic.entity';

@Entity('user_selected_topics')
@Index(['userId', 'topicId'], { unique: true }) // Updated composite unique index
export class UserSelectedTopic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ nullable: true })
  topicId: number; // Foreign key to Topic

  @Column({ nullable: true })
  topic: string; // Deprecated - keep for backward compatibility

  @CreateDateColumn()
  selectedAt: Date;

  @ManyToOne(() => User, user => user.userSelectedTopics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // New relation to Topic
  @ManyToOne(() => Topic, topic => topic.userSelectedTopics, { nullable: true })
  @JoinColumn({ name: 'topicId' })
  topicEntity: Topic;
}
