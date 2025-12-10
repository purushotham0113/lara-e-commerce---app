import express from 'express';
import { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  createProductReview,
  getFeaturedProducts 
} from '../controllers/productController.js';
import { protect, vendor } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getAllProducts)
  .post(protect, vendor, createProduct);

router.route('/featured')
  .get(getFeaturedProducts);

router.route('/:id')
  .get(getProductById)
  .put(protect, vendor, updateProduct)
  .delete(protect, vendor, deleteProduct);

router.route('/:id/reviews').post(protect, createProductReview);

export default router;