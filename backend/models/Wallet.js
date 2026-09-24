const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    unique: true
  },
  purchasedXP: {
    type: Number,
    default: 0
  },
  bonusXP: {
    type: Number,
    default: 0
  },
  bonusXPExpiresAt: {
    type: Date
  },
  lifetimeXPBurned: {
    type: Number,
    default: 0
  },
  lifetimeBonusEarned: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Virtual property for total available XP
walletSchema.virtual('totalAvailableXP').get(function() {
  let validBonus = this.bonusXP;
  if (this.bonusXPExpiresAt && new Date() > this.bonusXPExpiresAt) {
    validBonus = 0; // Expired
  }
  return this.purchasedXP + validBonus;
});

// Ensure virtual fields are serialized
walletSchema.set('toJSON', { virtuals: true });
walletSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Wallet', walletSchema);
