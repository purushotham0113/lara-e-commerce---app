import mongoose from 'mongoose';
import dotenv from 'dotenv';
import users from './data/users.js';
import products from './data/products.js';
import coupons from './data/coupons.js';
import banners from './data/banners.js'; // Added

// Models
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Cart from './models/Cart.js';
import Payment from './models/Payment.js';
import Review from './models/Review.js';
import Coupon from './models/Coupon.js';
import ReturnRefund from './models/ReturnRefund.js';
import Wishlist from './models/Wishlist.js';
import Banner from './models/Banner.js'; // Added

import connectDB from './config/db.js';

dotenv.config();

connectDB();

const importData = async () => {
    try {
        console.log('🗑️  Clearing Database...');
        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();
        await Cart.deleteMany();
        await Payment.deleteMany();
        await Review.deleteMany();
        await Coupon.deleteMany();
        await ReturnRefund.deleteMany();
        await Wishlist.deleteMany();
        await Banner.deleteMany(); // Added

        console.log('🌱 Inserting Users...');
        // Create Users with Verified Status
        const createdUsers = [];
        for (const user of users) {
            const newUser = await User.create({ ...user, isVerified: true }); // Ensure all seed users are verified
            createdUsers.push(newUser);
        }

        // Assign Roles from created users based on email to ensure correct mapping
        const adminUser = createdUsers.find(u => u.isAdmin);
        const vendorUser = createdUsers.find(u => u.isVendor && u.isApproved);
        const customers = createdUsers.filter(u => !u.isAdmin && !u.isVendor);

        console.log('🌱 Inserting Banners...');
        // Create Banners
        await Banner.insertMany(banners);

        console.log('🌱 Inserting Products...');
        // Create Products (Split ownership between Admin and Vendor for testing)
        const sampleProducts = products.map((product, index) => {
            // Assign first 5 to Admin, rest to Vendor (if exists), else Admin
            const owner = (index < 5 || !vendorUser) ? adminUser._id : vendorUser._id;
            return { ...product, user: owner };
        });
        const createdProducts = await Product.insertMany(sampleProducts);

        console.log('🌱 Inserting Coupons...');
        // Create Coupons
        await Coupon.insertMany(coupons);

        console.log('🌱 Inserting Reviews...');
        // Create Reviews & Update Products
        for (const product of createdProducts) {
            // Randomly decide if product has reviews (70% chance)
            if (Math.random() > 0.3) {
                const numberOfReviews = Math.floor(Math.random() * 5) + 1; // 1 to 5 reviews
                let totalRating = 0;

                for (let i = 0; i < numberOfReviews; i++) {
                    const randomCustomer = customers[Math.floor(Math.random() * customers.length)] || adminUser; // Fallback to admin if no customers
                    const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars mostly
                    const reviewData = {
                        user: randomCustomer._id,
                        product: product._id,
                        name: randomCustomer.name,
                        rating: rating,
                        comment: 'Absolutely love this scent! Highly recommended.',
                    };

                    // Create standalone Review
                    await Review.create(reviewData);

                    // Add to Product embedded array
                    product.reviews.push(reviewData);
                    totalRating += rating;
                }

                product.numReviews = product.reviews.length;
                product.rating = totalRating / product.reviews.length;
                await product.save();
            }
        }

        console.log('🌱 Inserting Orders, Payments & Returns...');
        // Create Orders, Payments, Returns
        // Ensure we have customers to create orders for
        const orderPlacers = customers.length > 0 ? customers : [adminUser];

        for (const customer of orderPlacers) {
            // Create 1-3 orders per customer
            const numOrders = Math.floor(Math.random() * 3) + 1;

            for (let i = 0; i < numOrders; i++) {
                const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
                const variant = randomProduct.variants[0];
                const qty = 1;

                const itemsPrice = variant.price * qty;
                const shippingPrice = itemsPrice > 100 ? 0 : 10;
                const totalPrice = itemsPrice + shippingPrice;

                const isPaid = Math.random() > 0.2; // 80% paid
                const isDelivered = isPaid && Math.random() > 0.5;

                const order = new Order({
                    user: customer._id,
                    orderItems: [{
                        title: randomProduct.title,
                        quantity: qty,
                        image: randomProduct.image,
                        price: variant.price,
                        size: variant.size,
                        product: randomProduct._id,
                        vendor: randomProduct.user, // Important for vendor dashboard
                        status: isDelivered ? 'Delivered' : (isPaid ? 'Processing' : 'Pending') // Synced Status
                    }],
                    shippingAddress: {
                        address: '123 Fake St',
                        city: 'New York',
                        postalCode: '10001',
                        country: 'USA'
                    },
                    paymentMethod: 'Stripe',
                    itemsPrice,
                    shippingPrice,
                    totalPrice,
                    isPaid,
                    paidAt: isPaid ? Date.now() : null,
                    isDelivered,
                    deliveredAt: isDelivered ? Date.now() : null,
                    status: isDelivered ? 'Delivered' : (isPaid ? 'Processing' : 'Pending')
                });

                const createdOrder = await order.save();

                // Create Payment record if paid
                if (isPaid) {
                    await Payment.create({
                        order: createdOrder._id,
                        user: customer._id,
                        paymentMethod: 'Stripe',
                        paymentResult: { id: 'mock_payment_id', status: 'completed', email_address: customer.email },
                        amount: totalPrice,
                        status: 'Completed'
                    });
                }

                // Randomly create a return request (10% chance)
                if (isDelivered && Math.random() < 0.1) {
                    await ReturnRefund.create({
                        order: createdOrder._id,
                        user: customer._id,
                        reason: 'Scent was not as expected',
                        status: 'Pending',
                        refundAmount: totalPrice
                    });
                }
            }
        }

        console.log('🌱 Inserting Wishlists...');
        // Create Wishlists
        for (const customer of orderPlacers) {
            const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
            await Wishlist.create({
                user: customer._id,
                products: [{ product: randomProduct._id }]
            });
        }

        console.log('🌱 Inserting Carts...');
        // Create Carts
        for (const customer of orderPlacers) {
            const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
            const variant = randomProduct.variants[0];

            await Cart.create({
                user: customer._id,
                cartItems: [{
                    product: randomProduct._id,
                    title: randomProduct.title,
                    quantity: 1,
                    image: randomProduct.image,
                    price: variant.price,
                    size: variant.size
                }]
            });
        }

        console.log('✅ Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();
        await Cart.deleteMany();
        await Payment.deleteMany();
        await Review.deleteMany();
        await Coupon.deleteMany();
        await ReturnRefund.deleteMany();
        await Wishlist.deleteMany();
        await Banner.deleteMany();

        console.log('🔥 Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}