import { Router } from 'express';
import * as keywordsController from '../controllers/keywords.controller';

const router = Router();

// GET /api/keywords - Get all keywords
router.get('/', keywordsController.getAllKeywords);

// GET /api/keywords/active - Get active keywords only
router.get('/active', keywordsController.getActiveKeywords);

// POST /api/keywords - Create a new keyword
router.post('/', keywordsController.createKeyword);

// DELETE /api/keywords/:id - Delete a keyword
router.delete('/:id', keywordsController.deleteKeyword);

export default router;