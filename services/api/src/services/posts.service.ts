import pool from '../config/database';
import { Post, CreatePostDTO, PostWithKeyword } from '../models/Post';

// Get all posts with keyword information
export const getAllPosts = async (): Promise<PostWithKeyword[]> => {
  const result = await pool.query(
    `SELECT p.*, k.keyword 
     FROM posts p 
     JOIN keywords k ON p.keyword_id = k.id 
     ORDER BY p.posted_at DESC`
  );
  return result.rows;
};

// Get posts by keyword
export const getPostsByKeyword = async (keywordId: number): Promise<Post[]> => {
  const result = await pool.query(
    'SELECT * FROM posts WHERE keyword_id = $1 ORDER BY posted_at DESC',
    [keywordId]
  );
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
export const createPost = async (data: CreatePostDTO): Promise<Post> => {
  const result = await pool.query(
    `INSERT INTO posts (platform, external_id, author, content, keyword_id, posted_at) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING *`,
    [data.platform, data.external_id, data.author, data.content, data.keyword_id, data.posted_at]
  );
  return result.rows[0];
};

// Delete a post
export const deletePost = async (id: number): Promise<void> => {
  await pool.query('DELETE FROM posts WHERE id = $1', [id]);
};

// Get posts count by keyword
export const getPostsCountByKeyword = async (keywordId: number): Promise<number> => {
  const result = await pool.query(
    'SELECT COUNT(*) as count FROM posts WHERE keyword_id = $1',
    [keywordId]
  );
  return parseInt(result.rows[0].count);
};