import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('user_selected_topics')
@Index(['userId', 'topic'], { unique: true }) // Composite unique index
export class UserSelectedTopic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  topic: string;

  @CreateDateColumn()
  selectedAt: Date;

  @ManyToOne(() => User, user => user.userSelectedTopics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
