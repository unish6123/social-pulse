import { Request, Response } from 'express';
import * as postsService from '../services/posts.service';
import logger from '../config/logger';

// Get all posts
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await postsService.getAllPosts();
    res.json(posts);
  } catch (error) {
    logger.error('Error getting posts:', error);
    res.status(500).json({ error: 'Failed to retrieve posts' });
  }
};

// Get posts by keyword
export const getPostsByKeyword = async (req: Request, res: Response) => {
  try {
    const { keywordId } = req.params;
    const id = parseInt(keywordId as string);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid keyword ID' });
    }

    const posts = await postsService.getPostsByKeyword(id);
    res.json(posts);
  } catch (error) {
    logger.error('Error getting posts by keyword:', error);
    res.status(500).json({ error: 'Failed to retrieve posts' });
  }
};

// Get single post by ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const postId = parseInt(id as string);

    if (isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const post = await postsService.getPostById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    logger.error('Error getting post:', error);
    res.status(500).json({ error: 'Failed to retrieve post' });
  }
};

// Create a new post
export const createPost = async (req: Request, res: Response) => {
  try {
    const { platform, external_id, author, content, keyword_id, posted_at } = req.body;

    // Validation
    if (!platform || !external_id || !author || !content || !keyword_id || !posted_at) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if ( platform !== 'news' && platform !== 'nytimes') {
  return res.status(400).json({ error: 'Platform must be news channel or nytimes' });
}

    const newPost = await postsService.createPost({
      platform,
      external_id,
      author,
      content,
      keyword_id,
      posted_at: new Date(posted_at),
    });

    res.status(201).json(newPost);
  } catch (error: any) {
    logger.error('Error creating post:', error);

    // Handle foreign key constraint error (invalid keyword_id)
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Invalid keyword_id' });
    }

    res.status(500).json({ error: 'Failed to create post' });
  }
};

// Delete a post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const postId = parseInt(id as string);

    if (isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    await postsService.deletePost(postId);
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

// Get posts count by keyword
export const getPostsCountByKeyword = async (req: Request, res: Response) => {
  try {
    const { keywordId } = req.params;
    const id = parseInt(keywordId as string);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid keyword ID' });
    }

    const count = await postsService.getPostsCountByKeyword(id);
    res.json({ keyword_id: id, count });
  } catch (error) {
    logger.error('Error getting posts count:', error);
    res.status(500).json({ error: 'Failed to get posts count' });
  }
};