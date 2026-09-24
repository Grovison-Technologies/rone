const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  stationId: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  consoleType: {
    type: String,
    enum: ['PS4', 'PS5'],
    required: true
  },
  status: {
    type: String,
    enum: [
      'AVAILABLE',
      'ACTIVE',
      'PAUSED',
      'RESERVED',
      'MAINTENANCE',
      'OFFLINE'
    ],
    default: 'AVAILABLE'
  },
  controllerCount: {
    type: Number,
    default: 1
  },
  notes: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Station', stationSchema);
