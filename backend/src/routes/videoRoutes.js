import { Router } from 'express';
import { getVideoBySlug, getVideos } from '../controllers/videoController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', optionalAuth, getVideos);
router.get('/:slug', optionalAuth, getVideoBySlug);

export default router;
