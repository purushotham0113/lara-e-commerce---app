import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  paymentMethod: { type: String, required: true }, // Stripe, PayPal, COD
  paymentResult: {
    id: String,
    status: String,
    email_address: String,
  },
  amount: { type: Number, required: true },
  status: { type: String, default: 'Pending' }
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);