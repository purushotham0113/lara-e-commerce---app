import asyncHandler from 'express-async-handler';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';

// @desc    Create Payment Intent (Mock or Real if Stripe key exists)
// @route   POST /api/payment/create-intent
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.isPaid) {
    res.status(400);
    throw new Error('Order is already paid');
  }

  // Mocking Stripe Client Secret
  const clientSecret = `mock_sk_${order._id}_${Date.now()}`;

  res.json({
      success: true,
      clientSecret
  });
});

// @desc    Process/Verify Payment
// @route   POST /api/payment
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentMethod, paymentResult } = req.body;
  const order = await Order.findById(orderId);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.isPaid) {
    // Idempotency: If already paid, return success to prevent error on frontend retry
    return res.status(200).json({ success: true, message: 'Order already paid', data: order });
  }

  const payment = await Payment.create({
    order: order._id,
    user: req.user._id,
    paymentMethod,
    amount: order.totalPrice,
    paymentResult: paymentResult || { status: 'success' },
    status: 'Completed'
  });

  if (payment) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = paymentResult;
    await order.save();
  }

  res.status(200).json({ success: true, message: 'Payment verified', data: payment });
});

// @desc    Handle Cash On Delivery
// @route   POST /api/payment/cod
// @access  Private
const cashOnDelivery = asyncHandler(async (req, res) => {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (order.paymentMethod !== 'COD') {
        res.status(400);
        throw new Error('Order is not marked for Cash on Delivery');
    }

    // For COD, we do not mark as 'isPaid' immediately. 
    // We just confirm the order placement status.
    // Stock is already reserved at createOrder.

    res.json({ success: true, message: 'Order confirmed (COD)', data: order });
});

// @desc    Mark Order as Paid (Internal/Admin)
// @route   PUT /api/payment/:orderId/pay
// @access  Private/Admin
const markOrderAsPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.orderId);
    if(order) {
        if(order.isPaid) {
           return res.json({ success: true, message: 'Order already paid', data: order });
        }
        order.isPaid = true;
        order.paidAt = Date.now();
        const updatedOrder = await order.save();
        res.json({ success: true, data: updatedOrder });
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

const processPayment = verifyPayment;

export { createPaymentIntent, verifyPayment, processPayment, cashOnDelivery, markOrderAsPaid };