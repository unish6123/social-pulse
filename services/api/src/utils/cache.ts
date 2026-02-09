import redisClient from '../config/redis';
import logger from '../config/logger';

/**
 * Get data from Redis cache
 * @param key - Cache key
 * @returns Parsed JSON data or null if not found
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const cached = await redisClient.get(key);
    if (!cached) {
      logger.debug(`Cache MISS: ${key}`);
      return null;
    }
    logger.debug(`Cache HIT: ${key}`);
    return JSON.parse(cached) as T;
  } catch (error) {
    logger.error(`Cache get error for key ${key}:`, error);
    return null;
  }
};

/**
 * Set data in Redis cache with TTL
 * @param key - Cache key
 * @param value - Data to cache
 * @param ttl - Time to live in seconds (default: 300 = 5 minutes)
 */
export const setCache = async (
  key: string,
  value: any,
  ttl: number = 300
): Promise<void> => {
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
    logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`);
  } catch (error) {
    logger.error(`Cache set error for key ${key}:`, error);
  }
};

/**
 * Delete data from Redis cache
 * @param key - Cache key or pattern
 */
export const delCache = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
    logger.debug(`Cache DEL: ${key}`);
  } catch (error) {
    logger.error(`Cache delete error for key ${key}:`, error);
  }
};

/**
 * Delete multiple cache keys matching a pattern
 * @param pattern - Pattern to match (e.g., "sentiment:stats:*")
 */
export const delCachePattern = async (pattern: string): Promise<void> => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.debug(`Cache DEL pattern: ${pattern} (${keys.length} keys)`);
    }
  } catch (error) {
    logger.error(`Cache delete pattern error for ${pattern}:`, error);
  }
};