import { Router } from 'express';
import prisma from '../config/prisma.js';
import { searchVideos } from '../controllers/videoController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';
import { sendSuccess } from '../utils/response.js';
import adminRoutes from './adminRoutes.js';
import authRoutes from './authRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import videoRoutes from './videoRoutes.js';

const router = Router();

// Health check
router.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return sendSuccess(res, 'Lear(n)alie API is operational', {
      status: 'UP',
      database: 'CONNECTED',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      status: 'DEGRADED',
      database: 'DISCONNECTED',
      error: error.message,
    });
  }
});

// Search
router.get('/search', optionalAuth, searchVideos);

// Resource routes
router.use('/auth', authRoutes);
router.use('/videos', videoRoutes);
router.use('/categories', categoryRoutes);
router.use('/admin', adminRoutes);

export default router;
