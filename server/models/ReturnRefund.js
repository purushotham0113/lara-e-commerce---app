import mongoose from 'mongoose';

const returnRefundSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  refundAmount: { type: Number }
}, { timestamps: true });

export default mongoose.model('ReturnRefund', returnRefundSchema);