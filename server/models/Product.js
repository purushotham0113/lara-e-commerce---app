import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
}, { timestamps: true });

const variantSchema = new mongoose.Schema({
  size: { 
    type: String, 
    required: true, 
    enum: ['50ml', '100ml', '200ml'] 
  },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 }
});

const productSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'User' 
  }, 
  title: { type: String, required: true, trim: true },
  image: { type: String, required: true },
  images: [String], // Array of additional image URLs
  category: { 
    type: String, 
    required: true,
    enum: ['Floral', 'Woody', 'Citrus', 'Luxury', 'Oriental'],
    index: true
  }, 
  gender: { 
    type: String, 
    required: true, 
    enum: ['Men', 'Women', 'Unisex'],
    index: true
  },
  description: { type: String, required: true },
  variants: [variantSchema],
  reviews: [reviewSchema],
  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
  isFeatured: { type: Boolean, required: true, default: false }, // Admin Feature
  isApproved: { type: Boolean, required: true, default: true }, // Vendor Approval
  isDeleted: { type: Boolean, required: true, default: false } // Soft Delete
}, {
  timestamps: true
});

// Index for search
productSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Product', productSchema);