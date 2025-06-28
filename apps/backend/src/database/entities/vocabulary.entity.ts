import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { UserVocabulary } from './user-vocabulary.entity';

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

  @Column({ nullable: true })
  partOfSpeech: string;

  @Column({ nullable: true })
  level: string;

  @Column({ nullable: true })
  topic: string; // Thêm trường topic

  @Column({ nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserVocabulary, userVocabulary => userVocabulary.vocabulary)
  userVocabularies: UserVocabulary[];
}
