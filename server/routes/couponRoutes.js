import express from 'express';
import { validateCoupon, createCoupon, applyCoupon, deactivateCoupon, getCoupons } from '../controllers/couponController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validateRequest, validateCoupon as checkCouponRules } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, admin, checkCouponRules, validateRequest, createCoupon)
  .get(protect, admin, getCoupons);

router.route('/validate').post(protect, applyCoupon);

router.route('/:id').patch(protect, admin, deactivateCoupon);

export default router;