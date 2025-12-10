import express from 'express';
import { 
  getUserCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart, 
  syncCart 
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getUserCart)
  .post(protect, addToCart)
  .delete(protect, clearCart);

router.route('/sync').post(protect, syncCart);

// Update item quantity: requires Product ID and Variant Size
router.route('/:productId/:size')
  .put(protect, updateCartItem)
  .delete(protect, removeFromCart);

export default router;