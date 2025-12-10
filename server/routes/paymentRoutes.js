import express from 'express';
import { 
  createPaymentIntent, 
  verifyPayment, 
  cashOnDelivery 
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, verifyPayment);
router.route('/create-intent').post(protect, createPaymentIntent);
router.route('/cod').post(protect, cashOnDelivery);

export default router;