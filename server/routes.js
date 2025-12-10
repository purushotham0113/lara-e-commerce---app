import express from 'express';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import returnRefundRoutes from './routes/returnRefundRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js'; // Added

const router = express.Router();

// Mount all feature routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/cart', cartRoutes);
router.use('/payment', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/coupons', couponRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/returns', returnRefundRoutes);
router.use('/vendor', vendorRoutes); // Added

export default router;