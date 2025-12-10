import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';

// Helper to escape regex special characters for search security
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// @desc    Fetch all products (Excludes deleted)
// @route   GET /api/products
// @access  Public
const getAllProducts = asyncHandler(async (req, res) => {
  const match = { isDeleted: false }; // Only approved products public

  // Admin sees all in dashboard, but this is the public/shop API. 
  // If we want admin to use this, we might need a separate query param or route.
  // For simplicity, this route is Customer/Public facing.

  // Search Logic
  if (req.query.keyword) {
    const regex = new RegExp(escapeRegex(req.query.keyword), 'i');
    match.$or = [
      { title: regex },
      { description: regex },
      { category: regex }
    ];
  }

  // Filtering Logic
  if (req.query.category) {
    match.category = req.query.category;
  }

  if (req.query.gender) {
    match.gender = req.query.gender;
  }

  // Price Filter (Min/Max)
  if (req.query.minPrice || req.query.maxPrice) {
    match['variants.price'] = {};
    if (req.query.minPrice) match['variants.price'].$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) match['variants.price'].$lte = Number(req.query.maxPrice);
  }

  // Rating Filter
  if (req.query.rating) {
    match.rating = { $gte: Number(req.query.rating) };
  }

  // Featured Filter
  if (req.query.featured) {
    match.isFeatured = true;
  }

  // Build Query
  let query = Product.find(match);

  // Sorting Logic
  if (req.query.sort === 'price_asc') {
    query = query.sort({ 'variants.0.price': 1 });
  } else if (req.query.sort === 'price_desc') {
    query = query.sort({ 'variants.0.price': -1 });
  } else if (req.query.sort === 'rating') {
    query = query.sort({ rating: -1 });
  } else {
    query = query.sort({ createdAt: -1 });
  }

  const products = await query;

  res.json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isDeleted: false })
    .populate('reviews.user', 'name');

  if (product) {
    res.json({
      success: true,
      data: product
    });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Vendor/Admin
const createProduct = asyncHandler(async (req, res) => {
  try {
    const { title, price, description, image, images, category, gender, variants } = req.body;

    // Basic validation
    if (!title || !description || !category || !gender) {
      res.status(400);
      throw new Error('Please fill in all required fields (Name, Category, Gender, Description)');
    }

    const product = new Product({
      title,
      description,
      image: image || '/uploads/sample.jpg',
      images: images || [],
      category,
      gender,
      variants: variants || [{ size: '50ml', price: price || 0, stock: 0 }],
      price: variants && variants.length > 0 ? variants[0].price : (price || 0),
      user: req.user._id,
      numReviews: 0,
      isApproved: req.user.isAdmin ? true : false, // Admin: Auto-approve, Vendor: Pending
    });

    const createdProduct = await product.save();
    res.status(201).json({
      success: true,
      message: req.user.isAdmin ? 'Product created successfully' : 'Product submitted for approval',
      data: createdProduct
    });
  } catch (err) {

    res.status(500).json("internal server error")
  }

});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Vendor/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { title, price, description, image, images, category, gender, variants, isFeatured, isApproved } = req.body;

  const product = await Product.findOne({ _id: req.params.id, isDeleted: false });

  if (product) {
    // Permission Check
    if (product.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(403);
      throw new Error('Not authorized to edit this product');
    }

    product.title = title || product.title;
    product.description = description || product.description;
    product.image = image || product.image;
    product.category = category || product.category;
    product.gender = gender || product.gender;

    // Update additional images if provided
    if (images) {
      product.images = images;
    }

    if (variants) {
      product.variants = variants;
      if (variants.length > 0) {
        product.price = variants[0].price;
      }
    } else if (price) {
      product.price = price;
    }

    // Admin Specific Updates
    if (req.user.isAdmin) {
      if (isFeatured !== undefined) product.isFeatured = isFeatured;
      if (isApproved !== undefined) product.isApproved = isApproved;
    }

    const updatedProduct = await product.save();
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product (Soft Delete)
// @route   DELETE /api/products/:id
// @access  Private/Vendor/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    if (product.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(403);
      throw new Error('Not authorized to delete this product');
    }

    // Soft Delete
    product.isDeleted = true;
    await product.save();

    res.json({
      success: true,
      message: 'Product removed'
    });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findOne({ _id: req.params.id, isDeleted: false });

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ success: true, message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get Featured Products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isDeleted: false, isApproved: true }).limit(4);
  res.json({ success: true, data: products });
});

// Alias for common naming convention
const getProducts = getAllProducts;

export {
  getAllProducts,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getFeaturedProducts
};