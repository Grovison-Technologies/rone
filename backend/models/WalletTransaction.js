const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
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
  type: {
    type: String,
    enum: [
      'PURCHASE',
      'BONUS',
      'SESSION_USAGE',
      'MANUAL_ADD',
      'MANUAL_DEDUCT',
      'REFUND',
      'REVERSAL',
      'PROMOTION',
      'EXPIRY'
    ],
    required: true
  },
  beforeBalance: {
    type: Number,
    required: true
  },
  afterBalance: {
    type: Number,
    required: true
  },
  relatedSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  relatedPaymentId: {
    type: String // Optional reference to a payment record or external ID
  },
  staffResponsible: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reason: {
    type: String // For manual adjustments
  }
}, { timestamps: true });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
