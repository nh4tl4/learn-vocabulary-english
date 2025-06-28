import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './database/entities/user.entity';
import { Vocabulary } from './database/entities/vocabulary.entity';
import { UserVocabulary } from './database/entities/user-vocabulary.entity';

// Load environment variables
dotenv.config();

// Determine if we're in production (compiled) or development
const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'vocabulary_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  synchronize: false,
  logging: ['error', 'warn'],
  entities: [User, Vocabulary, UserVocabulary],
  migrations: isProduction
    ? ['dist/src/database/migrations/*.js']  // Production: compiled JS files
    : ['src/database/migrations/*.ts'],      // Development: TypeScript files
  subscribers: [],
});
