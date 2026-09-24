const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionNumber: {
    type: String,
    required: true,
    unique: true
  },
  station: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true
  },
  payerCustomer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  splitMethod: {
    type: String,
    enum: ['SINGLE', 'EQUAL'],
    default: 'SINGLE'
  },
  splitPayers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  }],
  startedAt: {
    type: Date,
    required: true
  },
  endedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'XP_EXHAUSTED'],
    default: 'ACTIVE'
  },
  gameName: {
    type: String,
    default: ''
  },
  totalBillableSeconds: {
    type: Number,
    default: 0
  },
  totalXPUsed: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  endedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
