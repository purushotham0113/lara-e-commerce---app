import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Banner from '../models/Banner.js';

// @desc    Get all users (Active Only)
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isDeleted: false }).select('-password');
  res.json({ success: true, data: users });
});

// @desc    Block/Unblock User
// @route   PUT /api/admin/users/:id/block
// @access  Admin
const toggleUserBlock = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error('Cannot block an admin user');
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      message: `User has been ${user.isBlocked ? 'blocked' : 'unblocked'}`,
      data: { _id: user._id, isBlocked: user.isBlocked }
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Approve Vendor
// @route   PUT /api/admin/users/:id/approve
// @access  Admin
const approveVendor = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    if (!user.isVendor) {
      res.status(400);
      throw new Error('User is not a vendor');
    }

    console.log("checking if exist")
    user.isApproved = true;
    await user.save();

    res.json({ success: true, message: `Vendor ${user.name} approved` });
  } catch (err) {
    console.log("er", err)
    res.status(500).json("internal server error")
  }
});

// @desc    Delete user (Soft Delete)
// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error('Cannot delete admin user');
    }

    user.isDeleted = true;
    await user.save();

    res.json({ success: true, message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Reset User Password (Admin)
// @route   PUT /api/admin/users/:id/reset-password
// @access  Admin
const resetUserPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const user = await User.findById(req.params.id);

  if (user) {
    user.password = password; // Will be hashed by pre-save hook
    await user.save();
    res.json({ success: true, message: 'User password reset successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get Dashboard Stats (Advanced)
// @route   GET /api/admin/stats
// @access  Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    res.status(403);
    throw new Error('Access denied');
  }

  const userCount = await User.countDocuments({ isDeleted: false });
  const productCount = await Product.countDocuments({ isDeleted: false });
  const orderCount = await Order.countDocuments();

  // Revenue & Payment Breakdown
  const orders = await Order.find({ isPaid: true });
  const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);

  const paymentBreakdown = await Order.aggregate([
    { $group: { _id: "$paymentMethod", count: { $sum: 1 }, revenue: { $sum: "$totalPrice" } } }
  ]);

  // Top Selling Products (Simple aggregation)
  const topProducts = await Order.aggregate([
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.product",
        title: { $first: "$orderItems.title" },
        sold: { $sum: "$orderItems.quantity" }
      }
    },
    { $sort: { sold: -1 } },
    { $limit: 5 }
  ]);

  // Pending Vendors count
  const pendingVendors = await User.countDocuments({ isVendor: true, isApproved: false, isDeleted: false });

  res.json({
    success: true,
    data: {
      userCount,
      productCount,
      orderCount,
      totalRevenue,
      pendingVendors,
      paymentBreakdown,
      topProducts
    }
  });
});


// --- BANNER MANAGEMENT ---

// @desc    Create Banner
// @route   POST /api/admin/banners
// @access  Admin
const createBanner = asyncHandler(async (req, res) => {
  const { title, image, link, position } = req.body;
  const banner = await Banner.create({ title, image, link, position });
  res.status(201).json({ success: true, data: banner });
});

// @desc    Get All Banners
// @route   GET /api/admin/banners
// @access  Admin (or Public via separate route if needed)
const getBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({}).sort({ position: 1 });
  res.json({ success: true, data: banners });
});

// @desc    Delete Banner
// @route   DELETE /api/admin/banners/:id
// @access  Admin
const deleteBanner = asyncHandler(async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Banner deleted' });
});

// @desc    Toggle Banner Status
// @route   PUT /api/admin/banners/:id/toggle
// @access  Admin
const toggleBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (banner) {
    banner.isActive = !banner.isActive;
    await banner.save();
    res.json({ success: true, data: banner });
  } else {
    res.status(404);
    throw new Error('Banner not found');
  }
});

const getUsers = getAllUsers;

export {
  getAllUsers, getUsers, deleteUser, toggleUserBlock, resetUserPassword, approveVendor,
  getDashboardStats,
  createBanner, getBanners, deleteBanner, toggleBanner
};