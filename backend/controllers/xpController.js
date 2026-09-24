const XPPack = require('../models/XPPack');

// @desc    Get all XP packs
// @route   GET /api/xppacks
// @access  Private (Staff/Owner)
exports.getXPPacks = async (req, res) => {
  try {
    const packs = await XPPack.find({}).sort({ displayOrder: 1, price: 1 });
    res.json(packs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new XP pack
// @route   POST /api/xppacks
// @access  Private (Owner only)
exports.createXPPack = async (req, res) => {
  try {
    const { name, price, baseXP, bonusXP, isPopular, displayOrder } = req.body;

    const pack = await XPPack.create({
      name,
      price,
      baseXP,
      bonusXP,
      isPopular,
      displayOrder
    });

    res.status(201).json(pack);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update XP pack
// @route   PUT /api/xppacks/:id
// @access  Private (Owner only)
exports.updateXPPack = async (req, res) => {
  try {
    const pack = await XPPack.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pack) {
      return res.status(404).json({ message: 'Pack not found' });
    }
    res.json(pack);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
