import redisClient from '../config/redis';
import logger from '../config/logger';

// Get value from cache
export const getCache = async (key: string): Promise<any | null> => {
  try {
    const cached = await redisClient.get(key);
    
    if (cached) {
      logger.info(`Cache HIT: ${key}`);
      return JSON.parse(cached);
    }
    
    logger.info(`Cache MISS: ${key}`);
    return null;
  } catch (error) {
    logger.error(`Cache GET error for key ${key}:`, error);
    return null; // Fail gracefully, don't break the app
  }
};

// Set value in cache with TTL (time to live in seconds)
export const setCache = async (
  key: string,
  value: any,
  ttl: number = 300 // Default 5 minutes
): Promise<void> => {
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
    logger.info(`Cache SET: ${key} (TTL: ${ttl}s)`);
  } catch (error) {
    logger.error(`Cache SET error for key ${key}:`, error);
    // Don't throw - caching is optional, app should work without it
  }
};

// Delete value from cache
export const delCache = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
    logger.info(`Cache DELETE: ${key}`);
  } catch (error) {
    logger.error(`Cache DELETE error for key ${key}:`, error);
  }
};

// Delete multiple keys matching a pattern
export const delCachePattern = async (pattern: string): Promise<void> => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.info(`Cache DELETE pattern: ${pattern} (${keys.length} keys)`);
    }
  } catch (error) {
    logger.error(`Cache DELETE pattern error for ${pattern}:`, error);
  }
};