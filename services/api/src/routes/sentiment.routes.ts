import { Router } from 'express';
import * as sentimentController from '../controllers/sentiment.controller';

const router = Router();

// GET /api/sentiment - Get all sentiment analyses
router.get('/', sentimentController.getAllSentiment);

// GET /api/sentiment/post/:postId - Get sentiment for a specific post
router.get('/post/:postId', sentimentController.getSentimentByPostId);

// GET /api/sentiment/stats/keyword/:keywordId - Get sentiment stats for a keyword
router.get('/stats/keyword/:keywordId', sentimentController.getSentimentStatsByKeyword);

// POST /api/sentiment - Create sentiment analysis
router.post('/', sentimentController.createSentiment);

// DELETE /api/sentiment/:id - Delete sentiment analysis
router.delete('/:id', sentimentController.deleteSentiment);

export default router;