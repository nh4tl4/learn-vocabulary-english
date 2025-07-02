import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import {User} from "./database/entities/user.entity";
import {Vocabulary} from "./database/entities/vocabulary.entity";
import {UserVocabulary} from "./database/entities/user-vocabulary.entity";
import {UserSelectedTopic} from "./database/entities/user-selected-topic.entity";
import {UserTopicHistory} from "./database/entities/user-topic-history.entity";
import {Topic} from "./database/entities/topic.entity";
import * as process from "node:process";

config(); // Load .env file

const isProduction = process.env.NODE_ENV === 'production';
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL, // Use connection string from Render
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  synchronize: false,
  logging: ['error', 'warn'],
  entities: [User, Vocabulary, UserVocabulary, UserSelectedTopic, UserTopicHistory, Topic],
  migrations: isProduction
    ? ['dist/src/database/migrations/*.js']  // Production: compiled JS files
    : ['src/database/migrations/*.ts'],      // Development: TypeScript files
  subscribers: [],
});
