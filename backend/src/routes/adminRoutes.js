import { Router } from 'express';
import { getDashboardStats } from '../controllers/adminDashboardController.js';
import {
  createCategory,
  createCategorySchema,
  deleteCategory,
  getAdminCategories,
  updateCategory,
  updateCategorySchema,
} from '../controllers/categoryController.js';
import {
  createRole,
  deleteRole,
  getRoles,
  roleSchema,
  updateRole,
  updateRoleSchema,
} from '../controllers/roleController.js';
import {
  getUsers,
  updateRoleSchema as updateUserRoleSchema,
  updateStatusSchema,
  updateUserRole,
  updateUserStatus,
} from '../controllers/userController.js';
import {
  createVideo,
  deleteVideo,
  getAdminVideoById,
  getAdminVideos,
  updateVideo,
  updateVideoSchema,
  videoSchema,
} from '../controllers/videoController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = Router();

// Apply requireAdmin to all admin routes
router.use(requireAdmin);

// Dashboard stats
router.get('/dashboard', getDashboardStats);

// Video Management
router.get('/videos', getAdminVideos);
router.get('/videos/:id', getAdminVideoById);
router.post('/videos', validate(videoSchema), createVideo);
router.patch('/videos/:id', validate(updateVideoSchema), updateVideo);
router.delete('/videos/:id', deleteVideo);

// Category Management
router.get('/categories', getAdminCategories);
router.post('/categories', validate(createCategorySchema), createCategory);
router.patch('/categories/:id', validate(updateCategorySchema), updateCategory);
router.delete('/categories/:id', deleteCategory);

// Role Management
router.get('/roles', getRoles);
router.post('/roles', validate(roleSchema), createRole);
router.patch('/roles/:id', validate(updateRoleSchema), updateRole);
router.delete('/roles/:id', deleteRole);

// User Management
router.get('/users', getUsers);
router.patch('/users/:id/role', validate(updateUserRoleSchema), updateUserRole);
router.patch('/users/:id/status', validate(updateStatusSchema), updateUserStatus);

export default router;
