import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cartItems: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    size: { type: String, required: true }
  }]
}, { timestamps: true });

export default mongoose.model('Cart', cartSchema);