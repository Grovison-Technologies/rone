const express = require('express');
const router = express.Router();
const { getRates, updateRate } = require('../controllers/rateController');
const { protect, staff, owner } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, staff, getRates);

router.route('/:id')
  .put(protect, owner, updateRate);

module.exports = router;
