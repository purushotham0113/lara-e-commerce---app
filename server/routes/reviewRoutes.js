import express from 'express';
import { createProductReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/:id').post(protect, createProductReview);

export default router;