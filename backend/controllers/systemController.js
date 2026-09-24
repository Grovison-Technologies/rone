const SystemSettings = require('../models/SystemSettings');

// @desc    Get system settings
// @route   GET /api/system
// @access  Private/Staff
const getSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({ isOffPeakModeActive: false });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching system settings' });
  }
};

// @desc    Toggle off-peak mode
// @route   PUT /api/system/toggle-peak
// @access  Private/Owner
const toggleOffPeakMode = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({ isOffPeakModeActive: false });
    }
    
    settings.isOffPeakModeActive = !settings.isOffPeakModeActive;
    await settings.save();
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error toggling off-peak mode' });
  }
};

module.exports = {
  getSystemSettings,
  toggleOffPeakMode
};
