import express from 'express';
import {
  getAllUsers,
  deleteUser,
  toggleUserBlock,
  resetUserPassword,
  getDashboardStats,
  approveVendor,
  createBanner,
  getBanners,
  deleteBanner,
  toggleBanner
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/users')
  .get(protect, admin, getAllUsers);

router.route('/users/:id')
  .delete(protect, admin, deleteUser);

router.route('/users/:id/block')
  .put(protect, admin, toggleUserBlock);

router.route('/users/:id/approve')
  .put(protect, admin, approveVendor);

router.route('/users/:id/reset-password')
  .put(protect, admin, resetUserPassword);

router.route('/stats')
  .get(protect, admin, getDashboardStats);

// Banner Routes
router.route('/banners')
  .get(getBanners) // Can be public depending on needs, but here used by admin panel. Public fetch usually in separate controller.
  .post(protect, admin, createBanner);

router.route('/banners/:id')
  .delete(protect, admin, deleteBanner);

router.route('/banners/:id/toggle')
  .put(protect, admin, toggleBanner);

export default router;