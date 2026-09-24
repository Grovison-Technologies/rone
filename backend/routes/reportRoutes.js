const express = require('express');
const router = express.Router();
const { getSummaryReport, getTransactions, getSessionLogs } = require('../controllers/reportController');
const { protect, owner } = require('../middleware/authMiddleware');

router.get('/summary', protect, owner, getSummaryReport);
router.get('/transactions', protect, owner, getTransactions);
router.get('/sessions', protect, owner, getSessionLogs);

module.exports = router;
