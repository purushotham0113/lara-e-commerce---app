import asyncHandler from 'express-async-handler';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products.product');

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }

  // Filter out null products (deleted products)
  const validProducts = wishlist.products
    .filter(item => item.product !== null)
    .map(item => item.product);
  
  res.json({
      success: true,
      data: validProducts
  });
});

// @desc    Add item to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Use atomic update with $addToSet to prevent race conditions and duplicates
  let wishlist = await Wishlist.findOneAndUpdate(
    { user: req.user._id },
    { 
      $addToSet: { products: { product: productId } } 
    },
    { new: true, upsert: true } // Create if doesn't exist
  ).populate('products.product');

  const validProducts = wishlist.products
    .filter(item => item.product !== null)
    .map(item => item.product);

  res.status(201).json({
      success: true,
      message: 'Product added to wishlist',
      data: validProducts
  });
});

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/:id
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const productId = req.params.id;

  const wishlist = await Wishlist.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { products: { product: productId } } },
    { new: true }
  ).populate('products.product');

  if (wishlist) {
    const validProducts = wishlist.products
        .filter(item => item.product !== null)
        .map(item => item.product);

    res.json({
        success: true,
        message: 'Product removed from wishlist',
        data: validProducts
    });
  } else {
    res.status(404);
    throw new Error('Wishlist not found');
  }
});

export { getWishlist, addToWishlist, removeFromWishlist };