const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  // Use a singleton pattern by always querying a specific ID or just the first document
  isOffPeakModeActive: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
