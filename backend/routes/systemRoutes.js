const express = require('express');
const router = express.Router();
const { getSystemSettings, toggleOffPeakMode } = require('../controllers/systemController');
const { protect, staff, owner } = require('../middleware/authMiddleware');

router.route('/')
  .get(getSystemSettings); // Open/Staff can view

router.route('/toggle-peak')
  .put(protect, owner, toggleOffPeakMode);

module.exports = router;
