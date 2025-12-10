import express from 'express';
import { 
    addOrderItems, 
    getOrderById, 
    getMyOrders, 
    getOrders, 
    updateOrderToDelivered,
    getVendorOrders,
    updateOrderItemStatus,
    cancelOrder,
    getOrderInvoice
} from '../controllers/orderController.js';
import { protect, admin, vendor } from '../middleware/authMiddleware.js';
import { validateOrder, validateRequest } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, validateOrder, validateRequest, addOrderItems)
  .get(protect, admin, getOrders);

router.route('/myorders')
  .get(protect, getMyOrders);

// Vendor Routes
router.route('/vendor')
  .get(protect, vendor, getVendorOrders);

router.route('/:id/item/:itemId/status')
  .put(protect, vendor, updateOrderItemStatus);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/deliver')
  .put(protect, admin, updateOrderToDelivered);

router.route('/:id/cancel')
  .put(protect, cancelOrder);

router.route('/:id/invoice')
  .get(protect, getOrderInvoice);

export default router;