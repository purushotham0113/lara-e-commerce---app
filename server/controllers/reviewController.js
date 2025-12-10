import asyncHandler from 'express-async-handler';
import Review from '../models/Review.js';
import Product from '../models/Product.js';

// @desc    Create product review
// @route   POST /api/reviews/:id
// @access  Private
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = await Review.findOne({
      product: req.params.id,
      user: req.user._id,
    });

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('You have already reviewed this product');
    }

    const review = await Review.create({
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
      product: req.params.id,
    });

    // Update Product stats
    const reviews = await Review.find({ product: req.params.id });
    product.reviews.push(review); // Add to embedded array for quick access if needed
    product.numReviews = reviews.length;
    product.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    
    await product.save();

    res.status(201).json({ success: true, message: 'Review added', data: review });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get Product Reviews
// @route   GET /api/reviews/:id
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ product: req.params.id });
    res.json({ success: true, data: reviews });
});

// @desc    Delete Review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
const deleteReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if(!review) {
        res.status(404);
        throw new Error('Review not found');
    }

    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        res.status(403);
        throw new Error('Not authorized to delete this review');
    }

    await review.deleteOne();
    
    // Recalculate product rating
    const product = await Product.findById(review.product);
    if(product) {
        const reviews = await Review.find({ product: product._id });
        product.numReviews = reviews.length;
        product.rating = reviews.length > 0 
            ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length 
            : 0;
        
        // Remove from embedded array
        product.reviews = product.reviews.filter(r => r._id.toString() !== req.params.id);
        await product.save();
    }

    res.json({ success: true, message: 'Review deleted' });
});

// Alias
const createProductReview = addReview;

export { addReview, createProductReview, getProductReviews, deleteReview };