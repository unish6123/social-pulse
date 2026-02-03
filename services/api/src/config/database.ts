import { Pool, PoolConfig } from 'pg';
import logger from './logger';

const poolConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'social_pulse',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  logger.info('✅ Database connected');
});

pool.on('error', (err: Error) => {
  logger.error('❌ Database connection error:', err);
});

export default pool;