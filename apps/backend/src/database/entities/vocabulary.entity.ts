import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserVocabulary } from './user-vocabulary.entity';

@Entity()
export class Vocabulary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  word: string;

  @Column()
  meaning: string;

  @Column({ nullable: true })
  pronunciation: string;

  @Column({ nullable: true })
  example: string;

  @Column({ default: 'beginner' })
  level: string; // beginner, intermediate, advanced

  @Column({ default: 'noun' })
  partOfSpeech: string; // noun, verb, adjective, etc.

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserVocabulary, userVocabulary => userVocabulary.vocabulary)
  userVocabularies: UserVocabulary[];
}
