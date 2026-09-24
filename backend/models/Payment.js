const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['CASH', 'UPI', 'CARD', 'OTHER'],
    required: true
  },
  status: {
    type: String,
    enum: ['COMPLETED', 'PENDING', 'FAILED', 'REFUNDED', 'REVERSED'],
    default: 'COMPLETED'
  },
  xpPurchased: {
    type: Number,
    required: true
  },
  bonusXP: {
    type: Number,
    default: 0
  },
  staffResponsible: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
