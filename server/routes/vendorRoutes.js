import express from 'express';
import { getVendorStats } from '../controllers/vendorController.js';
import { protect, vendor } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/stats').get(protect, vendor, getVendorStats);

export default router;