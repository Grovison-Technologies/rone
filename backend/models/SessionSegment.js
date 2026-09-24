const mongoose = require('mongoose');

const sessionSegmentSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  startedAt: {
    type: Date,
    required: true
  },
  endedAt: {
    type: Date
  },
  playerCount: {
    type: Number,
    required: true
  },
  hourlyXPRate: {
    type: Number,
    required: true
  },
  billableSeconds: {
    type: Number,
    default: 0
  },
  xpConsumed: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('SessionSegment', sessionSegmentSchema);
