import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { Vocabulary } from './vocabulary.entity';
import { UserSelectedTopic } from './user-selected-topic.entity';
import { UserTopicHistory } from './user-topic-history.entity';

@Entity('topics')
export class Topic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  name: string; // Tên topic tiếng Anh

  @Column()
  nameVi: string; // Tên topic tiếng Việt

  @Column({ type: 'text', nullable: true })
  description: string; // Mô tả topic tiếng Anh

  @Column({ type: 'text', nullable: true })
  descriptionVi: string; // Mô tả topic tiếng Việt

  @Column({ nullable: true })
  icon: string; // Icon cho topic (emoji hoặc URL)

  @Column({ default: 0 })
  displayOrder: number; // Thứ tự hiển thị

  @Column({ default: true })
  isActive: boolean; // Có đang active không

  @Column({ default: 0 })
  vocabularyCount: number; // Số lượng từ vựng trong topic này

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Vocabulary, vocabulary => vocabulary.topicEntity)
  vocabularies: Vocabulary[];

  @OneToMany(() => UserSelectedTopic, userSelectedTopic => userSelectedTopic.topic)
  userSelectedTopics: UserSelectedTopic[];

  @OneToMany(() => UserTopicHistory, userTopicHistory => userTopicHistory.topic)
  userTopicHistories: UserTopicHistory[];
}
