import { Router } from 'express';
import { getCategories, getCategoryBySlug } from '../controllers/categoryController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getCategories);
router.get('/:slug', optionalAuth, getCategoryBySlug);

export default router;
