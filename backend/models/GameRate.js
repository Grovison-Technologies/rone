const mongoose = require('mongoose');

const gameRateSchema = new mongoose.Schema({
  consoleType: {
    type: String,
    enum: ['PS4', 'PS5'],
    required: true
  },
  playerCount: {
    type: Number,
    required: true // e.g., 1, 2, 3, 4
  },
  hourlyXPRate: {
    type: Number,
    required: true
  },
  offPeakXPRate: {
    type: Number,
    default: function() { return this.hourlyXPRate; } // Default to normal rate
  }
}, { timestamps: true });

// Compound index to ensure uniqueness per console and player count
gameRateSchema.index({ consoleType: 1, playerCount: 1 }, { unique: true });

module.exports = mongoose.model('GameRate', gameRateSchema);
