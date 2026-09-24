const express = require('express');
const router = express.Router();
const { startSession, pauseSession, resumeSession, changePlayers, endSession, getActiveSessions, getMyActiveSession } = require('../controllers/sessionController');
const { protect, protectCustomer, staff } = require('../middleware/authMiddleware');

router.get('/active', protect, staff, getActiveSessions);
router.get('/my-active', protectCustomer, getMyActiveSession);
router.post('/start', protect, staff, startSession);
router.put('/:id/pause', protect, staff, pauseSession);
router.put('/:id/resume', protect, staff, resumeSession);
router.put('/:id/players', protect, staff, changePlayers);
router.put('/:id/end', protect, staff, endSession);

module.exports = router;
