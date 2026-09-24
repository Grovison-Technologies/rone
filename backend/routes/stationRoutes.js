const express = require('express');
const router = express.Router();
const { getStations, createStation, updateStationStatus, updateStation } = require('../controllers/stationController');
const { protect, protectCustomer, staff, owner } = require('../middleware/authMiddleware');

router.get('/customer', protectCustomer, getStations);

router.route('/')
  .get(protect, staff, getStations)
  .post(protect, owner, createStation);

router.route('/:id/status')
  .put(protect, staff, updateStationStatus);

router.route('/:id')
  .put(protect, owner, updateStation);

module.exports = router;
