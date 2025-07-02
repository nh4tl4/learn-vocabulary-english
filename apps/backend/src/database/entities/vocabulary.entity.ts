import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { UserVocabulary } from './user-vocabulary.entity';
import { Topic } from './topic.entity';

@Entity()
export class Vocabulary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  word: string;

  @Column()
  meaning: string;

  @Column({ nullable: true })
  pronunciation: string;

  @Column({ type: 'text', nullable: true })
  example: string;

  @Column({ type: 'text', nullable: true })
  exampleVi: string;

  @Column({ nullable: true })
  partOfSpeech: string;

  //beginger || intermediate || advanced
  @Column({ nullable: true })
  level: string;

  @Column({ nullable: true })
  topicId: number; // Foreign key to Topic

  @Column({ nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserVocabulary, userVocabulary => userVocabulary.vocabulary)
  userVocabularies: UserVocabulary[];

  // New relation to Topic
  @ManyToOne(() => Topic, topic => topic.vocabularies, { nullable: true })
  @JoinColumn({ name: 'topicId' })
  topicEntity: Topic;
}
