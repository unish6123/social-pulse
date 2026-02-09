import { Request, Response } from 'express';
import * as sentimentService from '../services/sentiment.service';
import logger from '../config/logger';

// Get all sentiment analyses
export const getAllSentiment = async (req: Request, res: Response) => {
  try {
    const sentiment = await sentimentService.getAllSentiment();
    res.json(sentiment);
  } catch (error) {
    logger.error('Error getting sentiment:', error);
    res.status(500).json({ error: 'Failed to retrieve sentiment analyses' });
  }
};

// Get sentiment for a specific post
export const getSentimentByPostId = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const id = parseInt(postId as string);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const sentiment = await sentimentService.getSentimentByPostId(id);

    if (!sentiment) {
      return res.status(404).json({ error: 'Sentiment analysis not found for this post' });
    }

    res.json(sentiment);
  } catch (error) {
    logger.error('Error getting sentiment by post:', error);
    res.status(500).json({ error: 'Failed to retrieve sentiment' });
  }
};

// Create sentiment analysis
export const createSentiment = async (req: Request, res: Response) => {
  try {
    const { post_id, sentiment, score } = req.body;

    // Validation
    if (!post_id || !sentiment || score === undefined) {
      return res.status(400).json({ error: 'post_id, sentiment, and score are required' });
    }

    // Validate sentiment value
    if (!['positive', 'negative', 'neutral'].includes(sentiment)) {
      return res.status(400).json({ 
        error: 'sentiment must be positive, negative, or neutral' 
      });
    }

    // Validate score range
    const scoreNum = parseFloat(score);
    if (isNaN(scoreNum) || scoreNum < -1 || scoreNum > 1) {
      return res.status(400).json({ 
        error: 'score must be a number between -1.00 and 1.00' 
      });
    }

    const newSentiment = await sentimentService.createSentiment({
      post_id,
      sentiment,
      score: scoreNum,
    });

    res.status(201).json(newSentiment);
  } catch (error: any) {
    logger.error('Error creating sentiment:', error);

    // Handle foreign key constraint (invalid post_id)
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Invalid post_id' });
    }

    // Handle unique constraint (post already analyzed)
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Sentiment analysis already exists for this post' });
    }

    res.status(500).json({ error: 'Failed to create sentiment analysis' });
  }
};

// Delete sentiment analysis
export const deleteSentiment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sentimentId = parseInt(id as string);

    if (isNaN(sentimentId)) {
      return res.status(400).json({ error: 'Invalid sentiment ID' });
    }

    await sentimentService.deleteSentiment(sentimentId);
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting sentiment:', error);
    res.status(500).json({ error: 'Failed to delete sentiment analysis' });
  }
};

// Get sentiment statistics for a keyword
export const getSentimentStatsByKeyword = async (req: Request, res: Response) => {
  try {
    const { keywordId } = req.params;
    const id = parseInt(keywordId as string);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid keyword ID' });
    }

    const stats = await sentimentService.getSentimentStatsByKeyword(id);

    if (!stats) {
      return res.status(404).json({ error: 'Keyword not found' });
    }

    res.json(stats);
  } catch (error) {
    logger.error('Error getting sentiment stats:', error);
    res.status(500).json({ error: 'Failed to retrieve sentiment statistics' });
  }
};