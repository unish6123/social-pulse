import pool from '../config/database';
import { Post, CreatePostDTO, PostWithKeyword } from '../models/Post';
import { delCache, getCache, setCache } from './cache.service';

// Get all posts with keyword information
// Get all posts (WITH CACHING)
export const getAllPosts = async (): Promise<PostWithKeyword[]> => {
  const cacheKey = 'posts:all';
  
  // Try cache first
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Cache miss - query database
  const result = await pool.query(
    `SELECT p.*, k.keyword 
     FROM posts p 
     JOIN keywords k ON p.keyword_id = k.id 
     ORDER BY p.posted_at DESC`
  );
  
  // Cache for 2 minutes
  await setCache(cacheKey, result.rows, 120);
  
  return result.rows;
};

// Get posts by keyword
// Get posts by keyword (WITH CACHING)
export const getPostsByKeyword = async (keywordId: number): Promise<Post[]> => {
  const cacheKey = `posts:keyword:${keywordId}`;
  
  // Try cache first
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Cache miss - query database
  const result = await pool.query(
    'SELECT * FROM posts WHERE keyword_id = $1 ORDER BY posted_at DESC',
    [keywordId]
  );
  
  // Cache for 2 minutes (posts change frequently)
  await setCache(cacheKey, result.rows, 120);
  
  return result.rows;
};

// Get single post by ID
export const getPostById = async (id: number): Promise<PostWithKeyword | null> => {
  const result = await pool.query(
    `SELECT p.*, k.keyword 
     FROM posts p 
     JOIN keywords k ON p.keyword_id = k.id 
     WHERE p.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

// Create a new post

// Create a new post (WITH CACHE INVALIDATION)
export const createPost = async (data: CreatePostDTO): Promise<Post> => {
  const result = await pool.query(
    `INSERT INTO posts (platform, external_id, author, content, keyword_id, posted_at) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING *`,
    [data.platform, data.external_id, data.author, data.content, data.keyword_id, data.posted_at]
  );
  
  // Invalidate caches
  await delCache(`posts:keyword:${data.keyword_id}`);
  await delCache('posts:all');
  await delCache(`sentiment:stats:keyword:${data.keyword_id}`);
  
  return result.rows[0];
};


// Delete a post (WITH CACHE INVALIDATION)
// Delete a post (WITH CACHE INVALIDATION)
export const deletePost = async (id: number): Promise<void> => {
  // Get keyword_id before deleting
  const postResult = await pool.query('SELECT keyword_id FROM posts WHERE id = $1', [id]);
  
  // Delete the post
  await pool.query('DELETE FROM posts WHERE id = $1', [id]);
  
  // Invalidate caches if post existed
  if (postResult.rows.length > 0) {
    const keywordId = postResult.rows[0].keyword_id;
    await delCache(`posts:keyword:${keywordId}`);
    await delCache('posts:all');
    await delCache(`sentiment:stats:keyword:${keywordId}`);
  }
};

// Get posts count by keyword
export const getPostsCountByKeyword = async (keywordId: number): Promise<number> => {
  const result = await pool.query(
    'SELECT COUNT(*) as count FROM posts WHERE keyword_id = $1',
    [keywordId]
  );
  return parseInt(result.rows[0].count);
};