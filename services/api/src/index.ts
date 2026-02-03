import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import logger from './config/logger';
import pool from './config/database';
import redisClient, { connectRedis } from './config/redis';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT NOW()');
    
    // Check Redis connection
    await redisClient.ping();
    
    res.json({ 
      status: 'ok', 
      service: 'api',
      database: 'connected',
      redis: 'connected',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      service: 'api',
      timestamp: new Date().toISOString()
    });
  }
});

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('🛑 Shutting down gracefully...');
  
  try {
    await pool.end();
    await redisClient.quit();
    logger.info('✅ Connections closed');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const startServer = async () => {
  try {
    // Connect to Redis
    await connectRedis();
    
    // Test database connection
    await pool.query('SELECT NOW()');
    logger.info('✅ Database connected');
    
    // Start Express server
    app.listen(PORT, () => {
      logger.info(`🚀 API Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();