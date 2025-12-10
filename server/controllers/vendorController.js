import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Get Vendor Stats
// @route   GET /api/vendor/stats
// @access  Vendor
const getVendorStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // 1. My Products
    const products = await Product.find({ user: userId, isDeleted: false });
    const totalProducts = products.length;

    // 2. Low Stock (Checking variants)
    let lowStockCount = 0;
    products.forEach(p => {
        p.variants.forEach(v => {
            if(v.stock < 5) lowStockCount++;
        });
    });

    // 3. Vendor Orders & Revenue
    // Find orders where at least one item belongs to this vendor
    const orders = await Order.find({ 'orderItems.vendor': userId });
    
    let totalRevenue = 0;
    let totalSales = 0; // Number of items sold
    let ordersCount = orders.length;

    orders.forEach(order => {
        if(order.isPaid) {
            // Only count items belonging to this vendor
            const vendorItems = order.orderItems.filter(item => item.vendor.toString() === userId.toString());
            vendorItems.forEach(item => {
                totalRevenue += item.price * item.quantity;
                totalSales += item.quantity;
            });
        }
    });

    res.json({
        success: true,
        data: {
            totalProducts,
            lowStockCount,
            totalRevenue,
            totalSales,
            ordersCount
        }
    });
});

export { getVendorStats };