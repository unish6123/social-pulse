import { Router } from 'express';
import keywordsRoutes from './keywords.routes';
import postsRoutes from './posts.routes';
import sentimentRoutes from './sentiment.routes';

const router = Router();

// Mount routes
router.use('/keywords', keywordsRoutes);
router.use('/posts', postsRoutes);
router.use('/sentiment', sentimentRoutes);

// Health check (can also be here)
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API routes are working' });
});

export default router;