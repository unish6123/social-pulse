import { Router } from 'express';
import keywordsRoutes from './keywords.routes';

const router = Router();

// Mount routes
router.use('/keywords', keywordsRoutes);

// Health check (can also be here)
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API routes are working' });
});

export default router;