import { Router } from 'express';
import * as postsController from '../controllers/posts.controller';

const router = Router();

// GET /api/posts - Get all posts
router.get('/', postsController.getAllPosts);

// GET /api/posts/:id - Get single post by ID
router.get('/:id', postsController.getPostById);

// GET /api/posts/keyword/:keywordId - Get posts by keyword
router.get('/keyword/:keywordId', postsController.getPostsByKeyword);

// GET /api/posts/keyword/:keywordId/count - Get posts count by keyword
router.get('/keyword/:keywordId/count', postsController.getPostsCountByKeyword);

// POST /api/posts - Create a new post
router.post('/', postsController.createPost);

// DELETE /api/posts/:id - Delete a post
router.delete('/:id', postsController.deletePost);

export default router;