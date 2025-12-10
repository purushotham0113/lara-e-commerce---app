import { body, validationResult } from 'express-validator';

// Middleware to check validation results
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map(err => err.msg).join(', '));
  }
  next();
};

// Auth Validations
const validateRegister = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('isVendor').optional().isBoolean(),
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Order Validations
const validateOrder = [
  body('orderItems').isArray({ min: 1 }).withMessage('Order items must be a non-empty array'),
  body('shippingAddress.address').notEmpty().withMessage('Address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.postalCode').notEmpty().withMessage('Postal Code is required'),
  body('shippingAddress.country').notEmpty().withMessage('Country is required'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
];

// Coupon Validations
const validateCoupon = [
  body('code').notEmpty().withMessage('Coupon code is required').isLength({ min: 3 }),
  body('discountPercentage').isFloat({ min: 1, max: 100 }).withMessage('Discount must be between 1% and 100%'),
  body('expiryDate').isISO8601().withMessage('Valid expiry date is required').toDate(),
];

export { validateRequest, validateRegister, validateLogin, validateOrder, validateCoupon };