import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './src/database/entities/user.entity';
import { Vocabulary } from './src/database/entities/vocabulary.entity';
import { UserVocabulary } from './src/database/entities/user-vocabulary.entity';

// Load environment variables from current directory
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'vocabulary_db',
  ssl: { rejectUnauthorized: false }, // Bắt buộc SSL cho Neon
  synchronize: false,
  logging: true,
  entities: [User, Vocabulary, UserVocabulary],
  migrations: ['src/database/migrations/*.ts'],
  // Bỏ migrations để tránh lỗi import trong runtime
  subscribers: [],
});
