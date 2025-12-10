import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import generateInvoice from '../utils/invoiceGenerator.js';
import sendEmail from '../services/emailService.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, couponCode } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  const productIds = orderItems.map((item) => item.product);
  const dbProducts = await Product.find({ _id: { $in: productIds } });

  const secureOrderItems = [];

  // 1. Verify Products and Prices
  for (const itemFromClient of orderItems) {
    const matchingProduct = dbProducts.find(p => p._id.toString() === itemFromClient.product);

    if (!matchingProduct) {
      res.status(404);
      throw new Error(`Product not found: ${itemFromClient.product}`);
    }

    const variant = matchingProduct.variants.find(v => v.size === itemFromClient.size);

    if (!variant) {
      res.status(400);
      throw new Error(`Variant ${itemFromClient.size} not found for product ${matchingProduct.title}`);
    }

    if (variant.stock < itemFromClient.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${matchingProduct.title} (${variant.size})`);
    }

    secureOrderItems.push({
      product: matchingProduct._id,
      title: matchingProduct.title,
      image: matchingProduct.image,
      price: variant.price,
      size: variant.size,
      quantity: itemFromClient.quantity,
      vendor: matchingProduct.user, // IMPORTANT: Assign Vendor ID to item
      status: 'Processing'
    });
  }

  const itemsPrice = secureOrderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // 2. Handle Coupon
  let discountPrice = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (coupon && new Date(coupon.expiryDate) > Date.now()) {
      discountPrice = (itemsPrice * coupon.discountPercentage) / 100;
    }
  }

  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = 0.10 * (itemsPrice - discountPrice); // 10% Tax
  const totalPrice = itemsPrice - discountPrice + shippingPrice + taxPrice;

  const order = new Order({
    orderItems: secureOrderItems,
    user: req.user._id,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    discountPrice,
    couponCode: discountPrice > 0 ? couponCode : null,
    totalPrice,
    isPaid: false,
    status: 'Processing'
  });

  const createdOrder = await order.save();

  // 3. Decrement Stock
  for (const item of secureOrderItems) {
    await Product.updateOne(
      {
        _id: item.product,
        "variants.size": item.size,
        "variants.stock": { $gte: item.quantity }
      },
      { $inc: { "variants.$.stock": -item.quantity } }
    );
  }

  const populatedOrder = await Order.findById(createdOrder._id).populate('user', 'name email');

  // Notify User
  await sendEmail({
    to: req.user.email,
    subject: 'Order Confirmation - LARA',
    text: `Thank you for your order! Your order #${createdOrder._id} has been placed successfully.`
  });

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: populatedOrder
  });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    // Access: Admin, Order Owner, or Vendor (if they have items in it)
    const isVendorInvolved = order.orderItems.some(item => item.vendor.toString() === req.user._id.toString());

    if (req.user.isAdmin || order.user._id.equals(req.user._id) || isVendorInvolved) {
      res.json({ success: true, data: order });
    } else {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: orders });
});

// @desc    Get all orders (Admin Only)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
  res.json({ success: true, data: orders });
});

// @desc    Get orders containing vendor's products
// @route   GET /api/orders/vendor
// @access  Private/Vendor
const getVendorOrders = asyncHandler(async (req, res) => {
  // Find orders where ANY orderItem has the vendor's ID
  const orders = await Order.find({
    'orderItems.vendor': req.user._id
  }).populate('user', 'name email').sort({ createdAt: -1 });

  // Filter items in the response logic? No, send full order, Frontend filters items display.
  res.json({ success: true, data: orders });
});

// @desc    Update specific item status in an order
// @route   PUT /api/orders/:id/item/:itemId/status
// @access  Private/Vendor
// const updateOrderItemStatus = asyncHandler(async (req, res) => {
//   const { status } = req.body;
//   const { id, itemId } = req.params;

//   const order = await Order.findById(id).populate('user', 'email name');
//   if (!order) {
//     res.status(404);
//     throw new Error('Order not found');
//   }

//   const item = order.orderItems.find(i => i._id.toString() === itemId);
//   if (!item) {
//     res.status(404);
//     throw new Error('Item not found');
//   }

//   // Check ownership
//   if (item.vendor.toString() !== req.user._id.toString() && !req.user.isAdmin) {
//     res.status(403);
//     throw new Error('Not authorized to update this item');
//   }

//   item.status = status;

//   // Check if ALL items are delivered to update global status
//   const allDelivered = order.orderItems.every(i => i.status === 'Delivered');
//   if (allDelivered) {
//     order.isDelivered = true;
//     order.deliveredAt = Date.now();
//     order.status = 'Delivered';
//   } else if (order.isDelivered && !allDelivered) {
//     // If it was delivered but an item was reverted or cancelled (rare)
//   }

//   await order.save();

//   // Send Email Notification
//   await sendEmail({
//     to: order.user.email,
//     subject: `Order Update - Item ${status}`,
//     text: `Hello ${order.user.name},\n\nThe status of your item "${item.title}" in Order #${order._id} has been updated to: ${status}.`
//   });

//   res.json({ success: true, message: 'Item status updated', data: order });
// });

const updateOrderItemStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id, itemId } = req.params;

  // ✅ 1. Validate status
  const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status value');
  }

  // ✅ 2. Fetch order
  const order = await Order.findById(id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // ✅ 3. Bullet-proof item lookup (better than find)
  const item = order.orderItems.id(itemId);
  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  // ✅ 4. Ownership / admin check (safe optional chaining)
  if (
    item.vendor?.toString() !== req.user._id.toString() &&
    !req.user.isAdmin
  ) {
    res.status(403);
    throw new Error('Not authorized to update this item');
  }

  // ✅ 5. Update item status
  item.status = status;

  // ✅ 6. Sync GLOBAL order status correctly
  const allDelivered = order.orderItems.every(i => i.status === 'Delivered');
  const allShipped = order.orderItems.every(
    i => i.status === 'Shipped' || i.status === 'Delivered'
  );
  const anyCancelled = order.orderItems.some(i => i.status === 'Cancelled');

  if (allDelivered) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'Delivered';
  } else if (allShipped) {
    order.status = 'Shipped';
  } else if (anyCancelled) {
    order.status = 'Cancelled';
  } else {
    order.status = 'Processing';
  }

  // ✅ 7. Force mongoose to persist nested array updates
  order.markModified('orderItems');

  // ✅ 8. Save safely
  const updatedOrder = await order.save();
  await sendEmail({
    to: order.user.email,
    subject: `Order Update - Item ${status}`,
    text: `Hello ${order.user.name},\n\nThe status of your item "${item.title}" in Order #${order._id} has been updated to: ${status}.`
  });

  res.json({
    success: true,
    message: 'Item status updated successfully',
    data: updatedOrder,
  });
});






// @desc    Update order status (Global - Admin)
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'email name');

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'Delivered';
    // Update all items to Delivered
    order.orderItems.forEach(item => item.status = 'Delivered');

    const updatedOrder = await order.save();

    // Send Email Notification
    await sendEmail({
      to: order.user.email,
      subject: 'Order Delivered - LARA',
      text: `Hello ${order.user.name},\n\nGood news! Your order #${order._id} has been fully delivered. We hope you enjoy your purchase!`
    });

    res.json({ success: true, message: 'Order marked as delivered', data: updatedOrder });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Cancel Order (User)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'email name');
    if (!order) { res.status(404); throw new Error('Order not found'); }
    console.log("ordered user ", order.user._id.toString())
    console.log("frontend user ", req.user._id.toString())
    if (order.user._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }

    // Check global status
    if (order.status !== 'Processing') {
      res.status(400);
      throw new Error('Cannot cancel order after it has been shipped or delivered');
    }

    order.status = 'Cancelled';
    order.orderItems.forEach(item => item.status = 'Cancelled');
    const updatedOrder = await order.save();

    for (const item of order.orderItems) {
      await Product.updateOne(
        { _id: item.product, "variants.size": item.size },
        { $inc: { "variants.$.stock": item.quantity } }
      );
    }

    // Notify
    await sendEmail({
      to: order.user.email,
      subject: 'Order Cancelled - LARA',
      text: `Your order #${order._id} has been successfully cancelled.`
    });

    res.json({ success: true, message: 'Order cancelled', data: updatedOrder });
  } catch (err) {
    console.log("err ", err)
  }
});

// @desc    Get Order Invoice
// @route   GET /api/orders/:id/invoice
// @access  Private
const getOrderInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const invoiceText = generateInvoice(order);

  // Send as text/plain or create a simple HTML wrapper
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename=invoice_${order._id}.txt`);
  res.send(invoiceText);
});


// Aliases
const addOrderItems = createOrder;
const getOrders = getAllOrders;
const updateOrderToDelivered = updateOrderStatus;

export {
  createOrder, addOrderItems,
  getOrderById, getMyOrders, getAllOrders, getOrders, getVendorOrders,
  updateOrderStatus, updateOrderToDelivered, updateOrderItemStatus,
  cancelOrder, getOrderInvoice
};