import asyncHandler from 'express-async-handler';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getUserCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'cartItems.product',
      select: 'title image category' // Populate necessary fields only
  });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, cartItems: [] });
  }

  // Filter out items where the product reference is null (deleted products)
  cart.cartItems = cart.cartItems.filter(item => item.product !== null);
  if (cart.isModified('cartItems')) {
      await cart.save();
  }

  res.status(200).json({
    success: true,
    data: cart.cartItems
  });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, size, quantity } = req.body;

  // 1. Validate Product
  const product = await Product.findOne({ _id: productId, isDeleted: false });
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // 2. Validate Variant & Price (Security: Always fetch price from DB)
  const variant = product.variants.find(v => v.size === size);
  if(!variant) {
      res.status(400);
      throw new Error(`Size ${size} not available for this product`);
  }

  // 3. Find or Create Cart
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, cartItems: [] });
  }

  // 4. Update existing item or push new one
  const itemIndex = cart.cartItems.findIndex(p => p.product.toString() === productId && p.size === size);

  if (itemIndex > -1) {
    // Check stock before incrementing (Optional: depends on strictness)
    // if (variant.stock < cart.cartItems[itemIndex].quantity + (quantity || 1)) ...
    
    cart.cartItems[itemIndex].quantity += quantity || 1;
    // Update price in case it changed in DB since last add
    cart.cartItems[itemIndex].price = variant.price; 
  } else {
    cart.cartItems.push({
      product: productId,
      title: product.title,
      image: product.image,
      price: variant.price,
      size: size,
      quantity: quantity || 1
    });
  }

  await cart.save();
  
  // Return populated cart
  const populatedCart = await Cart.findById(cart._id).populate('cartItems.product', 'title image');

  res.status(200).json({
    success: true,
    message: 'Item added to cart',
    data: populatedCart.cartItems
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId/:size
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const { productId, size } = req.params;

  if (quantity < 1) {
      res.status(400);
      throw new Error('Quantity must be at least 1');
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  // Find specific item by Product ID AND Size
  const itemIndex = cart.cartItems.findIndex(
      item => item.product.toString() === productId && item.size === size
  );
  
  if (itemIndex > -1) {
      cart.cartItems[itemIndex].quantity = Number(quantity);
      await cart.save();
      res.json({ success: true, message: 'Cart updated', data: cart.cartItems });
  } else {
      res.status(404);
      throw new Error('Item not found in cart');
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId/:size
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const { productId, size } = req.params;
  const cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    cart.cartItems = cart.cartItems.filter(
        item => !(item.product.toString() === productId && item.size === size)
    );
    await cart.save();
    res.json({ success: true, message: 'Item removed', data: cart.cartItems });
  } else {
    res.status(404);
    throw new Error('Cart not found');
  }
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
      cart.cartItems = [];
      await cart.save();
  }
  res.json({ success: true, message: 'Cart cleared' });
});

// @desc    Sync cart (Legacy/Frontend Logic support)
// @route   POST /api/cart/sync
// @access  Private
const syncCart = asyncHandler(async (req, res) => {
    const { cartItems } = req.body; // Array from local storage
    
    if (!Array.isArray(cartItems)) {
        res.status(400);
        throw new Error('Invalid cart data');
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
       cart = new Cart({ user: req.user._id, cartItems: [] });
    }

    // Merge logic: Overwrite backend cart with frontend cart (simplest for sync)
    // Or complex merge: add quantities. 
    // For this implementation, we will trust the frontend's latest state regarding *items*, 
    // but re-validate prices from DB to ensure security.
    
    const secureItems = [];
    
    for (const item of cartItems) {
        const product = await Product.findById(item.product);
        if (product && !product.isDeleted) {
            const variant = product.variants.find(v => v.size === item.size);
            if (variant) {
                secureItems.push({
                    product: product._id,
                    title: product.title,
                    image: product.image,
                    size: item.size,
                    price: variant.price, // Always take DB price
                    quantity: item.quantity
                });
            }
        }
    }

    cart.cartItems = secureItems;
    await cart.save();

    res.status(200).json({ success: true, message: 'Cart synced', data: cart.cartItems });
});

export { getUserCart, addToCart, updateCartItem, removeFromCart, clearCart, syncCart };