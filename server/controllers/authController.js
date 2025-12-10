import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../services/emailService.js';

// @desc    Register a new user & Send OTP
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, isVendor } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

  const user = await User.create({
    name,
    email,
    password,
    isVendor: Boolean(isVendor),
    isApproved: isVendor ? false : true,
    isVerified: false,
    otp,
    otpExpiry
  });

  if (user) {
    // Send OTP Email
    await sendEmail({
      to: email,
      subject: 'LARA - Verify Your Email',
      text: `Hello ${name},\n\nYour verification code is: ${otp}\n\nThis code will expire in 15 minutes.`
    });

    res.status(201).json({
      success: true,
      message: `Verification code sent to ${email}`,
      data: {
        email: user.email,
        requiresVerification: true
      }
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Verify OTP and Login
// @route   POST /api/auth/verify
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    throw new Error('User not found');
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error('User already verified');
  }

  if (user.otp !== otp || user.otpExpiry < Date.now()) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  // OTP Valid
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Email verified successfully',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isVendor: user.isVendor,
      isApproved: user.isApproved,
      token: generateToken(user._id),
    }
  });
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {

    if (user.isDeleted) {
      res.status(403);
      throw new Error('This account has been deactivated.');
    }

    if (user.isBlocked) {
      res.status(403);
      throw new Error('Access denied. This account has been blocked.');
    }

    // Check Verification
    if (!user.isVerified) {
      res.status(401);
      throw new Error('Email not verified. Please verify your account.');
    }

    if (user.isVendor && !user.isApproved) {
      res.status(403);
      throw new Error('Your vendor account is pending approval by an administrator.');
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isVendor: user.isVendor,
        token: generateToken(user._id),
      }
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (user && !user.isDeleted && !user.isBlocked) {
    res.json({
      success: true,
      data: user
    });
  } else {
    res.status(404);
    throw new Error('User not found or account disabled');
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;

    if (req.body.password) {
      user.password = req.body.password;
    }

    // Handle Address Updates
    if (req.body.address) {
      const newAddress = req.body.address;
      // If marked default, unset others
      if (newAddress.isDefault) {
        user.addresses.forEach(a => a.isDefault = false);
      }
      user.addresses.push(newAddress);
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        isVendor: updatedUser.isVendor,
        token: generateToken(updatedUser._id),
      },
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export { registerUser, verifyEmail, loginUser, getMe, updateUserProfile, logoutUser };