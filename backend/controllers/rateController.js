const GameRate = require('../models/GameRate');

// @desc    Get all game rates
// @route   GET /api/rates
// @access  Private
exports.getRates = async (req, res) => {
  try {
    const rates = await GameRate.find({}).sort({ consoleType: -1, playerCount: 1 });
    res.json(rates);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a game rate
// @route   PUT /api/rates/:id
// @access  Private (Owner only)
exports.updateRate = async (req, res) => {
  try {
    const rate = await GameRate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!rate) {
      return res.status(404).json({ message: 'Rate not found' });
    }
    res.json(rate);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
