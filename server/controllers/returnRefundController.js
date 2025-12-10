import asyncHandler from 'express-async-handler';
import ReturnRefund from '../models/ReturnRefund.js';
import Order from '../models/Order.js';

// @desc    Request a return
// @route   POST /api/returns
// @access  Private
const createReturnRequest = asyncHandler(async (req, res) => {
  const { orderId, reason } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const existingRequest = await ReturnRefund.findOne({ order: orderId });
  if (existingRequest) {
    res.status(400);
    throw new Error('Return request already pending for this order');
  }

  const returnRequest = await ReturnRefund.create({
    order: orderId,
    user: req.user._id,
    reason,
    refundAmount: order.totalPrice
  });

  res.status(201).json({
    success: true,
    message: 'Return requested successfully',
    data: returnRequest
  });
});

// @desc    Get my return requests
// @route   GET /api/returns/my
// @access  Private
const getMyReturnRequests = asyncHandler(async (req, res) => {
  const returns = await ReturnRefund.find({ user: req.user._id }).populate('order');

  res.json({ success: true, data: returns });
});

// @desc    Get all return requests (Admin)
// @route   GET /api/returns
// @access  Private/Admin
const getAllReturnRequests = asyncHandler(async (req, res) => {
  const returns = await ReturnRefund.find({}).populate('user', 'name email').populate('order');

  res.json({ success: true, data: returns });
});

// @desc    Update return status
// @route   PATCH /api/returns/:id
// @access  Private/Admin
const updateReturnStatus = asyncHandler(async (req, res) => {
  const { status } = req.body; // Approved, Rejected
  const returnRequest = await ReturnRefund.findById(req.params.id);

  if (returnRequest) {
    returnRequest.status = status;
    const updatedReturn = await returnRequest.save();
    res.json({ success: true, message: `Return request ${status}`, data: updatedReturn });
  } else {
    res.status(404);
    throw new Error('Return request not found');
  }
});

// Aliases
const requestReturn = createReturnRequest;
const getMyReturns = getMyReturnRequests;
const getAllReturns = getAllReturnRequests;

export {
  createReturnRequest, requestReturn,
  getMyReturnRequests, getMyReturns,
  getAllReturnRequests, getAllReturns,
  updateReturnStatus
};