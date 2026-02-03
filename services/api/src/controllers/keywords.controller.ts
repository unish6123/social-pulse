import { Request, Response } from 'express';
import * as keywordsService from '../services/keywords.service';
import logger from '../config/logger';

// Get all keywords
export const getAllKeywords = async (req: Request, res: Response) => {
  try {
    const keywords = await keywordsService.getAllKeywords();
    res.json(keywords);
  } catch (error) {
    logger.error('Error getting keywords:', error);
    res.status(500).json({ error: 'Failed to retrieve keywords' });
  }
};

// Get active keywords only
export const getActiveKeywords = async (req: Request, res: Response) => {
  try {
    const keywords = await keywordsService.getActiveKeywords();
    res.json(keywords);
  } catch (error) {
    logger.error('Error getting active keywords:', error);
    res.status(500).json({ error: 'Failed to retrieve active keywords' });
  }
};

// Create a new keyword
export const createKeyword = async (req: Request, res: Response) => {
  try {
    const { keyword } = req.body;

    if (!keyword || keyword.trim() === '') {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const newKeyword = await keywordsService.createKeyword({ keyword: keyword.trim() });
    res.status(201).json(newKeyword);
  } catch (error: any) {
    logger.error('Error creating keyword:', error);
    
    // Handle duplicate keyword error
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Keyword already exists' });
    }
    
    res.status(500).json({ error: 'Failed to create keyword' });
  }
};

// Delete a keyword
export const deleteKeyword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const keywordId = parseInt(id as string);

    if (isNaN(keywordId)) {
      return res.status(400).json({ error: 'Invalid keyword ID' });
    }

    await keywordsService.deleteKeyword(keywordId);
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting keyword:', error);
    res.status(500).json({ error: 'Failed to delete keyword' });
  }
};