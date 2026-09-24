const express = require('express');
const router = express.Router();
const { getXPPacks, createXPPack, updateXPPack } = require('../controllers/xpController');
const { protect, staff, owner } = require('../middleware/authMiddleware');

router.route('/')
  .get(getXPPacks)
  .post(protect, owner, createXPPack);

router.route('/:id')
  .put(protect, owner, updateXPPack);

module.exports = router;
