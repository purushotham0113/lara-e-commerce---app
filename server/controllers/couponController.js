import asyncHandler from 'express-async-handler';
import Coupon from '../models/Coupon.js';

// @desc    Create Coupon
// @route   POST /api/coupons
// @access  Admin
const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountPercentage, expiryDate } = req.body;
  
  const coupon = await Coupon.create({ 
      code: code.toUpperCase(), 
      discountPercentage, 
      expiryDate 
  });
  
  res.status(201).json({
      success: true,
      message: 'Coupon created',
      data: coupon
  });
});

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Admin
const getCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find({});
    res.json({ success: true, data: coupons });
});

// @desc    Apply/Validate Coupon
// @route   POST /api/coupons/validate
// @access  Private
const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

  if (coupon && new Date(coupon.expiryDate) > Date.now()) {
    res.json({
      success: true,
      data: {
        code: coupon.code,
        discountPercentage: coupon.discountPercentage
      }
    });
  } else {
    res.status(400);
    throw new Error('Invalid or expired coupon');
  }
});

// @desc    Deactivate Coupon
// @route   PATCH /api/coupons/:id
// @access  Admin
const deactivateCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);
    if(coupon) {
        coupon.isActive = !coupon.isActive;
        await coupon.save();
        res.json({ success: true, message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'}`, data: coupon });
    } else {
        res.status(404);
        throw new Error('Coupon not found');
    }
});

// Alias for backward compatibility
const validateCoupon = applyCoupon;

export { createCoupon, getCoupons, applyCoupon, validateCoupon, deactivateCoupon };