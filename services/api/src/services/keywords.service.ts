import pool from '../config/database';
import { Keyword, CreateKeywordDTO } from '../models/Keyword';
import { getCache, setCache, delCache } from './cache.service';

// Get all keywords (WITH CACHING)
export const getAllKeywords = async (): Promise<Keyword[]> => {
  const cacheKey = 'keywords:all';
  
  // Try cache first
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Cache miss - query database
  const result = await pool.query(
    'SELECT * FROM keywords ORDER BY created_at DESC'
  );
  
  // Cache for 10 minutes (keywords don't change often)
  await setCache(cacheKey, result.rows, 600);
  
  return result.rows;
};

// Get active keywords (WITH CACHING)
export const getActiveKeywords = async (): Promise<Keyword[]> => {
  const cacheKey = 'keywords:active';
  
  // Try cache first
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Cache miss - query database
  const result = await pool.query(
    'SELECT * FROM keywords WHERE is_active = true ORDER BY created_at DESC'
  );
  
  // Cache for 10 minutes
  await setCache(cacheKey, result.rows, 600);
  
  return result.rows;
};

// Create keyword (WITH CACHE INVALIDATION)
export const createKeyword = async (
  data: CreateKeywordDTO
): Promise<Keyword> => {
  const result = await pool.query(
    'INSERT INTO keywords (keyword) VALUES ($1) RETURNING *',
    [data.keyword]
  );
  
  // Invalidate keyword caches
  await delCache('keywords:all');
  await delCache('keywords:active');
  
  return result.rows[0];
};

// Delete keyword (WITH CACHE INVALIDATION)
export const deleteKeyword = async (id: number): Promise<void> => {
  await pool.query('DELETE FROM keywords WHERE id = $1', [id]);
  
  // Invalidate keyword caches
  await delCache('keywords:all');
  await delCache('keywords:active');
};