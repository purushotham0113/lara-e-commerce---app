import express from 'express';
import { requestReturn, getMyReturns, getAllReturns, updateReturnStatus } from '../controllers/returnRefundController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, requestReturn)
  .get(protect, admin, getAllReturns);

router.route('/my')
  .get(protect, getMyReturns);

router.route('/:id')
  .patch(protect, admin, updateReturnStatus);

export default router;