import pool from '../config/database';
import { getCache, setCache, delCache } from './cache.service';  
import {
  SentimentAnalysis,
  CreateSentimentDTO,
  SentimentWithPost,
  SentimentStats,
} from '../models/SentimentAnalysis';

// Get all sentiment analyses
export const getAllSentiment = async (): Promise<SentimentWithPost[]> => {
  const result = await pool.query(
    `SELECT s.*, p.platform, p.content, k.keyword 
     FROM sentiment_analysis s
     JOIN posts p ON s.post_id = p.id
     JOIN keywords k ON p.keyword_id = k.id
     ORDER BY s.analyzed_at DESC`
  );
  return result.rows;
};

// Get sentiment for a specific post
export const getSentimentByPostId = async (
  postId: number
): Promise<SentimentAnalysis | null> => {
  const result = await pool.query(
    'SELECT * FROM sentiment_analysis WHERE post_id = $1',
    [postId]
  );
  return result.rows[0] || null;
};

// Create sentiment analysis
// Create sentiment analysis (WITH CACHE INVALIDATION)
export const createSentiment = async (
  data: CreateSentimentDTO
): Promise<SentimentAnalysis> => {
  // 1. Create the sentiment analysis
  const result = await pool.query(
    `INSERT INTO sentiment_analysis (post_id, sentiment, score) 
     VALUES ($1, $2, $3) 
     RETURNING *`,
    [data.post_id, data.sentiment, data.score]
  );
  
  // 2. Get the post to find which keyword it belongs to
  const postResult = await pool.query(
    'SELECT keyword_id FROM posts WHERE id = $1',
    [data.post_id]
  );
  
  if (postResult.rows.length > 0) {
    const keywordId = postResult.rows[0].keyword_id;
    
    // 3. INVALIDATE the cache for this keyword's stats
    await delCache(`sentiment:stats:keyword:${keywordId}`);
  }
  
  return result.rows[0];
};

// Delete sentiment analysis
export const deleteSentiment = async (id: number): Promise<void> => {
  await pool.query('DELETE FROM sentiment_analysis WHERE id = $1', [id]);
};

// Get sentiment statistics for a keyword
// Get sentiment statistics for a keyword (WITH CACHING)
// Get sentiment statistics for a keyword (WITH CACHING)
export const getSentimentStatsByKeyword = async (
  keywordId: number
): Promise<SentimentStats | null> => {
  const cacheKey = `sentiment:stats:keyword:${keywordId}`;
  
  // 1. Try to get from cache
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached; // Cache HIT - return immediately!
  }
  
  // 2. Cache MISS - query database
  // Get keyword name
  const keywordResult = await pool.query(
    'SELECT keyword FROM keywords WHERE id = $1',
    [keywordId]
  );

  if (keywordResult.rows.length === 0) {
    return null;
  }

  const keyword = keywordResult.rows[0].keyword;

  // Get total posts for this keyword
  const totalPostsResult = await pool.query(
    'SELECT COUNT(*) as count FROM posts WHERE keyword_id = $1',
    [keywordId]
  );
  const totalPosts = parseInt(totalPostsResult.rows[0].count);

  // Get sentiment breakdown
  const sentimentResult = await pool.query(
    `SELECT 
       s.sentiment,
       COUNT(*) as count,
       AVG(s.score) as avg_score
     FROM sentiment_analysis s
     JOIN posts p ON s.post_id = p.id
     WHERE p.keyword_id = $1
     GROUP BY s.sentiment`,
    [keywordId]
  );

  // Initialize breakdown
  const breakdown = {
    positive: 0,
    negative: 0,
    neutral: 0,
  };

  let totalAnalyzed = 0;
  let totalScore = 0;

  // Process results
  sentimentResult.rows.forEach((row) => {
    const count = parseInt(row.count);
    breakdown[row.sentiment as keyof typeof breakdown] = count;
    totalAnalyzed += count;
    totalScore += parseFloat(row.avg_score) * count;
  });

  const averageScore = totalAnalyzed > 0 ? totalScore / totalAnalyzed : 0;

  // Calculate percentages
  const percentages = {
    positive: totalAnalyzed > 0 ? (breakdown.positive / totalAnalyzed) * 100 : 0,
    negative: totalAnalyzed > 0 ? (breakdown.negative / totalAnalyzed) * 100 : 0,
    neutral: totalAnalyzed > 0 ? (breakdown.neutral / totalAnalyzed) * 100 : 0,
  };

  const stats = {
    keyword_id: keywordId,
    keyword,
    total_posts: totalPosts,
    analyzed_posts: totalAnalyzed,
    sentiment_breakdown: breakdown,
    average_score: Math.round(averageScore * 100) / 100,
    percentages: {
      positive: Math.round(percentages.positive * 10) / 10,
      negative: Math.round(percentages.negative * 10) / 10,
      neutral: Math.round(percentages.neutral * 10) / 10,
    },
  };

  // 3. Save to cache (5 minutes TTL)
  await setCache(cacheKey, stats, 300);

  return stats;
};